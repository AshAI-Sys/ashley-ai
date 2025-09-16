const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const advancedFinanceController = {
  
  // ===== ACCOUNTS RECEIVABLE (AR) =====

  // Get all invoices for a workspace
  async getInvoices(req, res) {
    try {
      const { workspaceId } = req.params;
      const { status, clientId, brandId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
      
      const skip = (page - 1) * limit;
      const where = { workspaceId };
      
      if (status) where.status = status;
      if (clientId) where.clientId = clientId;
      if (brandId) where.brandId = brandId;
      if (dateFrom || dateTo) {
        where.invoiceDate = {};
        if (dateFrom) where.invoiceDate.gte = new Date(dateFrom);
        if (dateTo) where.invoiceDate.lte = new Date(dateTo);
      }
      
      const invoices = await prisma.invoice.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, company: true } },
          brand: { select: { id: true, name: true } },
          orders: { include: { order: { select: { orderNumber: true } } } },
          payments: { include: { payment: true } },
          invoiceLines: true
        },
        orderBy: { invoiceDate: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      });
      
      const total = await prisma.invoice.count({ where });
      
      res.json({
        invoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  },

  // Get invoice by ID
  async getInvoiceById(req, res) {
    try {
      const { invoiceId } = req.params;
      
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          client: true,
          brand: true,
          orders: { include: { order: true } },
          invoiceLines: true,
          payments: {
            include: {
              payment: {
                include: {
                  paymentMethod: true
                }
              }
            }
          },
          creditNotes: true
        }
      });
      
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      res.json(invoice);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      res.status(500).json({ error: 'Failed to fetch invoice' });
    }
  },

  // Create new invoice
  async createInvoice(req, res) {
    try {
      const {
        workspaceId,
        clientId,
        brandId,
        orderIds,
        invoiceLines,
        taxMode,
        vatRate,
        discountPercent,
        discountAmount,
        notes,
        dueDate
      } = req.body;
      
      // Generate invoice number
      const invoiceCount = await prisma.invoice.count({ where: { workspaceId } });
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;
      
      // Calculate totals
      let subtotal = 0;
      const processedLines = invoiceLines.map(line => {
        const lineTotal = line.quantity * line.unitPrice;
        subtotal += lineTotal;
        return {
          ...line,
          total: lineTotal
        };
      });
      
      const discountAmountFinal = discountAmount || (subtotal * (discountPercent || 0) / 100);
      const discountedSubtotal = subtotal - discountAmountFinal;
      const vatAmount = taxMode === 'VAT_INCLUSIVE' ? discountedSubtotal * (vatRate / (100 + vatRate)) : discountedSubtotal * (vatRate / 100);
      const totalAmount = taxMode === 'VAT_INCLUSIVE' ? discountedSubtotal : discountedSubtotal + vatAmount;
      
      const invoice = await prisma.$transaction(async (tx) => {
        // Create invoice
        const newInvoice = await tx.invoice.create({
          data: {
            workspaceId,
            invoiceNumber,
            clientId,
            brandId,
            invoiceDate: new Date(),
            dueDate: dueDate ? new Date(dueDate) : null,
            status: 'DRAFT',
            taxMode,
            vatRate,
            subtotal,
            discountPercent,
            discountAmount: discountAmountFinal,
            vatAmount,
            totalAmount,
            balanceAmount: totalAmount,
            notes,
            createdBy: req.user.userId
          }
        });
        
        // Create invoice lines
        await tx.invoiceLine.createMany({
          data: processedLines.map(line => ({
            invoiceId: newInvoice.id,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            total: line.total,
            taxable: line.taxable || true
          }))
        });
        
        // Link orders if provided
        if (orderIds && orderIds.length > 0) {
          await tx.invoiceOrder.createMany({
            data: orderIds.map(orderId => ({
              invoiceId: newInvoice.id,
              orderId
            }))
          });
        }
        
        return newInvoice;
      });
      
      res.status(201).json(invoice);
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json({ error: 'Failed to create invoice' });
    }
  },

  // Record payment
  async recordPayment(req, res) {
    try {
      const {
        workspaceId,
        paymentMethod,
        amount,
        paymentDate,
        referenceNumber,
        notes,
        invoiceAllocations
      } = req.body;
      
      const payment = await prisma.$transaction(async (tx) => {
        // Create payment
        const newPayment = await tx.payment.create({
          data: {
            workspaceId,
            paymentMethod,
            amount,
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
            referenceNumber,
            notes,
            status: 'RECEIVED',
            createdBy: req.user.userId
          }
        });
        
        // Allocate to invoices
        let totalAllocated = 0;
        if (invoiceAllocations && invoiceAllocations.length > 0) {
          for (const allocation of invoiceAllocations) {
            await tx.paymentAllocation.create({
              data: {
                paymentId: newPayment.id,
                invoiceId: allocation.invoiceId,
                amount: allocation.amount
              }
            });
            
            // Update invoice balance
            await tx.invoice.update({
              where: { id: allocation.invoiceId },
              data: {
                balanceAmount: {
                  decrement: allocation.amount
                }
              }
            });
            
            totalAllocated += allocation.amount;
          }
          
          // Update payment allocated amount
          await tx.payment.update({
            where: { id: newPayment.id },
            data: {
              allocatedAmount: totalAllocated,
              unallocatedAmount: amount - totalAllocated
            }
          });
        }
        
        return newPayment;
      });
      
      res.status(201).json(payment);
    } catch (error) {
      console.error('Error recording payment:', error);
      res.status(500).json({ error: 'Failed to record payment' });
    }
  },

  // Get aging report
  async getAgingReport(req, res) {
    try {
      const { workspaceId } = req.params;
      const { asOfDate = new Date() } = req.query;
      
      const cutoffDate = new Date(asOfDate);
      
      const invoices = await prisma.invoice.findMany({
        where: {
          workspaceId,
          status: { not: 'CANCELLED' },
          balanceAmount: { gt: 0 }
        },
        include: {
          client: { select: { id: true, name: true, company: true } },
          brand: { select: { id: true, name: true } }
        }
      });
      
      const agingBuckets = {
        current: [], // 0-30 days
        days31to60: [], // 31-60 days
        days61to90: [], // 61-90 days
        over90: [] // 90+ days
      };
      
      let totals = {
        current: 0,
        days31to60: 0,
        days61to90: 0,
        over90: 0,
        total: 0
      };
      
      invoices.forEach(invoice => {
        const daysPastDue = Math.floor((cutoffDate - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));
        const balance = parseFloat(invoice.balanceAmount);
        
        const invoiceData = {
          ...invoice,
          daysPastDue,
          balance
        };
        
        if (daysPastDue <= 30) {
          agingBuckets.current.push(invoiceData);
          totals.current += balance;
        } else if (daysPastDue <= 60) {
          agingBuckets.days31to60.push(invoiceData);
          totals.days31to60 += balance;
        } else if (daysPastDue <= 90) {
          agingBuckets.days61to90.push(invoiceData);
          totals.days61to90 += balance;
        } else {
          agingBuckets.over90.push(invoiceData);
          totals.over90 += balance;
        }
        
        totals.total += balance;
      });
      
      res.json({
        asOfDate: cutoffDate,
        agingBuckets,
        totals
      });
    } catch (error) {
      console.error('Error generating aging report:', error);
      res.status(500).json({ error: 'Failed to generate aging report' });
    }
  },

  // ===== ACCOUNTS PAYABLE (AP) =====

  // Get bills
  async getBills(req, res) {
    try {
      const { workspaceId } = req.params;
      const { status, supplierId, page = 1, limit = 20 } = req.query;
      
      const skip = (page - 1) * limit;
      const where = { workspaceId };
      
      if (status) where.status = status;
      if (supplierId) where.supplierId = supplierId;
      
      const bills = await prisma.bill.findMany({
        where,
        include: {
          supplier: { select: { id: true, name: true, company: true } },
          billLines: true,
          payments: { include: { payment: true } }
        },
        orderBy: { billDate: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      });
      
      const total = await prisma.bill.count({ where });
      
      res.json({
        bills,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching bills:', error);
      res.status(500).json({ error: 'Failed to fetch bills' });
    }
  },

  // ===== COSTING & P&L =====

  // Calculate PO Cost Sheet
  async calculatePOCosts(req, res) {
    try {
      const { orderId } = req.params;
      
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          lineItems: true,
          materialUsage: true,
          laborRecords: true,
          overheadAllocations: true
        }
      });
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Calculate material costs
      let materialCost = 0;
      if (order.materialUsage) {
        materialCost = order.materialUsage.reduce((sum, usage) => sum + (usage.quantity * usage.unitCost), 0);
      }
      
      // Calculate labor costs from payroll
      let laborCost = 0;
      if (order.laborRecords) {
        laborCost = order.laborRecords.reduce((sum, record) => sum + record.cost, 0);
      }
      
      // Calculate overhead costs
      let overheadCost = 0;
      if (order.overheadAllocations) {
        overheadCost = order.overheadAllocations.reduce((sum, allocation) => sum + allocation.amount, 0);
      }
      
      const totalCOGS = materialCost + laborCost + overheadCost;
      const revenue = order.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const grossMargin = revenue - totalCOGS;
      const marginPercent = revenue > 0 ? (grossMargin / revenue) * 100 : 0;
      
      const costSheet = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        revenue,
        costs: {
          material: materialCost,
          labor: laborCost,
          overhead: overheadCost,
          total: totalCOGS
        },
        grossMargin,
        marginPercent,
        calculatedAt: new Date()
      };
      
      // Save cost sheet
      await prisma.pOCostSheet.upsert({
        where: { orderId },
        update: costSheet,
        create: {
          ...costSheet,
          workspaceId: order.workspaceId
        }
      });
      
      res.json(costSheet);
    } catch (error) {
      console.error('Error calculating PO costs:', error);
      res.status(500).json({ error: 'Failed to calculate PO costs' });
    }
  },

  // Get Brand P&L
  async getBrandPnL(req, res) {
    try {
      const { workspaceId, brandId } = req.params;
      const { dateFrom, dateTo } = req.query;
      
      const dateFilter = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      
      // Get revenue from invoices
      const invoices = await prisma.invoice.findMany({
        where: {
          workspaceId,
          brandId,
          ...(dateFrom || dateTo ? { invoiceDate: dateFilter } : {})
        },
        include: {
          orders: { include: { order: { include: { costSheet: true } } } }
        }
      });
      
      let totalRevenue = 0;
      let totalCOGS = 0;
      let totalReturns = 0;
      let totalFees = 0;
      
      invoices.forEach(invoice => {
        totalRevenue += parseFloat(invoice.totalAmount);
        
        // Calculate COGS from linked orders
        invoice.orders.forEach(invoiceOrder => {
          if (invoiceOrder.order.costSheet) {
            totalCOGS += parseFloat(invoiceOrder.order.costSheet.costs.total || 0);
          }
        });
      });
      
      // Get returns/refunds
      const creditNotes = await prisma.creditNote.findMany({
        where: {
          workspaceId,
          brandId,
          ...(dateFrom || dateTo ? { createdAt: dateFilter } : {})
        }
      });
      
      totalReturns = creditNotes.reduce((sum, cn) => sum + parseFloat(cn.amount), 0);
      
      const grossProfit = totalRevenue - totalCOGS - totalReturns;
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      
      const pnl = {
        brandId,
        period: { from: dateFrom, to: dateTo },
        metrics: {
          revenue: totalRevenue,
          cogs: totalCOGS,
          returns: totalReturns,
          platformFees: totalFees,
          grossProfit,
          grossMargin
        }
      };
      
      res.json(pnl);
    } catch (error) {
      console.error('Error calculating brand P&L:', error);
      res.status(500).json({ error: 'Failed to calculate brand P&L' });
    }
  },

  // ===== FINANCIAL ANALYTICS =====

  // Get cashflow forecast
  async getCashflowForecast(req, res) {
    try {
      const { workspaceId } = req.params;
      const { months = 3 } = req.query;
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + parseInt(months));
      
      // Get current cash balance (simplified - would come from bank/cash accounts)
      const currentCash = 100000; // Placeholder
      
      // Get expected inflows (outstanding invoices by due date)
      const expectedInflows = await prisma.invoice.findMany({
        where: {
          workspaceId,
          status: { not: 'CANCELLED' },
          balanceAmount: { gt: 0 },
          dueDate: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { dueDate: 'asc' }
      });
      
      // Get expected outflows (outstanding bills by due date)
      const expectedOutflows = await prisma.bill.findMany({
        where: {
          workspaceId,
          status: { not: 'CANCELLED' },
          balanceAmount: { gt: 0 },
          dueDate: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { dueDate: 'asc' }
      });
      
      // Generate monthly forecast
      const forecast = [];
      let runningBalance = currentCash;
      
      for (let i = 0; i < months; i++) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() + i);
        monthStart.setDate(1);
        
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        
        const monthlyInflows = expectedInflows
          .filter(inv => inv.dueDate >= monthStart && inv.dueDate <= monthEnd)
          .reduce((sum, inv) => sum + parseFloat(inv.balanceAmount), 0);
        
        const monthlyOutflows = expectedOutflows
          .filter(bill => bill.dueDate >= monthStart && bill.dueDate <= monthEnd)
          .reduce((sum, bill) => sum + parseFloat(bill.balanceAmount), 0);
        
        const netCashFlow = monthlyInflows - monthlyOutflows;
        runningBalance += netCashFlow;
        
        forecast.push({
          month: monthStart.toISOString().substring(0, 7),
          openingBalance: runningBalance - netCashFlow,
          inflows: monthlyInflows,
          outflows: monthlyOutflows,
          netCashFlow,
          closingBalance: runningBalance,
          isNegative: runningBalance < 0
        });
      }
      
      res.json({
        currentCash,
        forecast,
        summary: {
          totalInflows: expectedInflows.reduce((sum, inv) => sum + parseFloat(inv.balanceAmount), 0),
          totalOutflows: expectedOutflows.reduce((sum, bill) => sum + parseFloat(bill.balanceAmount), 0),
          worstCaseBalance: Math.min(...forecast.map(f => f.closingBalance))
        }
      });
    } catch (error) {
      console.error('Error generating cashflow forecast:', error);
      res.status(500).json({ error: 'Failed to generate cashflow forecast' });
    }
  },

  // Get financial KPIs
  async getFinancialKPIs(req, res) {
    try {
      const { workspaceId } = req.params;
      const { period = 'month' } = req.query;
      
      const startDate = new Date();
      if (period === 'month') {
        startDate.setDate(1);
      } else if (period === 'quarter') {
        startDate.setMonth(startDate.getMonth() - 3);
      } else if (period === 'year') {
        startDate.setMonth(0, 1);
      }
      
      // Revenue metrics
      const revenue = await prisma.invoice.aggregate({
        where: {
          workspaceId,
          invoiceDate: { gte: startDate },
          status: { not: 'CANCELLED' }
        },
        _sum: { totalAmount: true }
      });
      
      // Outstanding AR
      const outstandingAR = await prisma.invoice.aggregate({
        where: {
          workspaceId,
          status: { not: 'CANCELLED' },
          balanceAmount: { gt: 0 }
        },
        _sum: { balanceAmount: true }
      });
      
      // Outstanding AP
      const outstandingAP = await prisma.bill.aggregate({
        where: {
          workspaceId,
          status: { not: 'CANCELLED' },
          balanceAmount: { gt: 0 }
        },
        _sum: { balanceAmount: true }
      });
      
      // Average collection period (simplified)
      const avgCollectionDays = 30; // Would calculate from actual payment data
      
      const kpis = {
        period,
        revenue: revenue._sum.totalAmount || 0,
        outstandingAR: outstandingAR._sum.balanceAmount || 0,
        outstandingAP: outstandingAP._sum.balanceAmount || 0,
        avgCollectionDays,
        workingCapital: (outstandingAR._sum.balanceAmount || 0) - (outstandingAP._sum.balanceAmount || 0)
      };
      
      res.json(kpis);
    } catch (error) {
      console.error('Error calculating financial KPIs:', error);
      res.status(500).json({ error: 'Failed to calculate financial KPIs' });
    }
  }
};

module.exports = advancedFinanceController;