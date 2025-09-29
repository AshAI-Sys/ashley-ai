const { db } = require('@ash-ai/database');
const QRCode = require('qrcode');

const prisma = db;

const deliveryController = {
  // Get all deliveries for a workspace
  async getDeliveries(req, res) {
    try {
      const { workspaceId } = req.params;
      const { status, page = 1, limit = 20 } = req.query;
      
      const skip = (page - 1) * limit;
      const where = { workspaceId };
      
      if (status) {
        where.status = status;
      }
      
      const deliveries = await prisma.delivery.findMany({
        where,
        include: {
          order: {
            select: { id: true, orderNumber: true, customerName: true }
          },
          shipments: {
            include: {
              cartons: {
                include: {
                  carton: {
                    select: { id: true, cartonNumber: true, totalPieces: true }
                  }
                }
              }
            }
          },
          trackingEvents: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      });
      
      const total = await prisma.delivery.count({ where });
      
      res.json({
        deliveries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
  },

  // Get delivery by ID
  async getDeliveryById(req, res) {
    try {
      const { deliveryId } = req.params;
      
      const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId },
        include: {
          order: {
            select: { 
              id: true, 
              orderNumber: true, 
              customerName: true,
              customerAddress: true,
              customerPhone: true,
              customerEmail: true
            }
          },
          shipments: {
            include: {
              cartons: {
                include: {
                  carton: {
                    select: { 
                      id: true, 
                      cartonNumber: true, 
                      totalPieces: true,
                      weight: true,
                      dimensions: true
                    }
                  }
                }
              }
            }
          },
          trackingEvents: {
            orderBy: { timestamp: 'desc' }
          }
        }
      });
      
      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }
      
      res.json(delivery);
    } catch (error) {
      console.error('Error fetching delivery:', error);
      res.status(500).json({ error: 'Failed to fetch delivery' });
    }
  },

  // Create new delivery
  async createDelivery(req, res) {
    try {
      const {
        workspaceId,
        orderId,
        shipmentIds,
        carrierName,
        trackingNumber,
        estimatedDeliveryDate,
        deliveryAddress,
        specialInstructions
      } = req.body;
      
      // Generate delivery reference
      const deliveryRef = `DEL-${Date.now()}`;
      
      const delivery = await prisma.$transaction(async (tx) => {
        // Create delivery
        const newDelivery = await tx.delivery.create({
          data: {
            workspaceId,
            orderId,
            deliveryReference: deliveryRef,
            carrierName,
            trackingNumber,
            status: 'PENDING',
            estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
            deliveryAddress,
            specialInstructions
          }
        });
        
        // Link shipments to delivery
        if (shipmentIds && shipmentIds.length > 0) {
          await tx.shipmentDelivery.createMany({
            data: shipmentIds.map(shipmentId => ({
              deliveryId: newDelivery.id,
              shipmentId
            }))
          });
        }
        
        // Create initial tracking event
        await tx.deliveryTrackingEvent.create({
          data: {
            deliveryId: newDelivery.id,
            status: 'PENDING',
            description: 'Delivery created and pending pickup',
            timestamp: new Date()
          }
        });
        
        return newDelivery;
      });
      
      res.status(201).json(delivery);
    } catch (error) {
      console.error('Error creating delivery:', error);
      res.status(500).json({ error: 'Failed to create delivery' });
    }
  },

  // Update delivery status
  async updateDeliveryStatus(req, res) {
    try {
      const { deliveryId } = req.params;
      const { status, location, description, timestamp } = req.body;
      
      const delivery = await prisma.$transaction(async (tx) => {
        // Update delivery status
        const updatedDelivery = await tx.delivery.update({
          where: { id: deliveryId },
          data: { 
            status,
            currentLocation: location || undefined,
            ...(status === 'DELIVERED' && { actualDeliveryDate: new Date() })
          }
        });
        
        // Add tracking event
        await tx.deliveryTrackingEvent.create({
          data: {
            deliveryId,
            status,
            location,
            description: description || `Status updated to ${status}`,
            timestamp: timestamp ? new Date(timestamp) : new Date()
          }
        });
        
        return updatedDelivery;
      });
      
      res.json(delivery);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      res.status(500).json({ error: 'Failed to update delivery status' });
    }
  },

  // Add delivery tracking event
  async addTrackingEvent(req, res) {
    try {
      const { deliveryId } = req.params;
      const { status, location, description, timestamp } = req.body;
      
      const trackingEvent = await prisma.deliveryTrackingEvent.create({
        data: {
          deliveryId,
          status,
          location,
          description,
          timestamp: timestamp ? new Date(timestamp) : new Date()
        }
      });
      
      // Update delivery current location if provided
      if (location) {
        await prisma.delivery.update({
          where: { id: deliveryId },
          data: { currentLocation: location }
        });
      }
      
      res.status(201).json(trackingEvent);
    } catch (error) {
      console.error('Error adding tracking event:', error);
      res.status(500).json({ error: 'Failed to add tracking event' });
    }
  },

  // Get delivery tracking history
  async getTrackingHistory(req, res) {
    try {
      const { deliveryId } = req.params;
      
      const trackingEvents = await prisma.deliveryTrackingEvent.findMany({
        where: { deliveryId },
        orderBy: { timestamp: 'desc' }
      });
      
      res.json(trackingEvents);
    } catch (error) {
      console.error('Error fetching tracking history:', error);
      res.status(500).json({ error: 'Failed to fetch tracking history' });
    }
  },

  // Update delivery location
  async updateLocation(req, res) {
    try {
      const { deliveryId } = req.params;
      const { latitude, longitude, address } = req.body;
      
      const delivery = await prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          currentLocation: address,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null
        }
      });
      
      // Add tracking event for location update
      await prisma.deliveryTrackingEvent.create({
        data: {
          deliveryId,
          status: delivery.status,
          location: address,
          description: `Location updated: ${address}`,
          timestamp: new Date()
        }
      });
      
      res.json(delivery);
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({ error: 'Failed to update location' });
    }
  },

  // Get deliveries by status
  async getDeliveriesByStatus(req, res) {
    try {
      const { workspaceId, status } = req.params;
      
      const deliveries = await prisma.delivery.findMany({
        where: {
          workspaceId,
          status: status.toUpperCase()
        },
        include: {
          order: {
            select: { id: true, orderNumber: true, customerName: true }
          },
          trackingEvents: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json(deliveries);
    } catch (error) {
      console.error('Error fetching deliveries by status:', error);
      res.status(500).json({ error: 'Failed to fetch deliveries by status' });
    }
  },

  // Get delivery performance metrics
  async getDeliveryMetrics(req, res) {
    try {
      const { workspaceId } = req.params;
      const { startDate, endDate } = req.query;
      
      const dateFilter = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      
      const whereClause = {
        workspaceId,
        ...(startDate || endDate ? { createdAt: dateFilter } : {})
      };
      
      // Get delivery counts by status
      const statusCounts = await prisma.delivery.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true
      });
      
      // Get on-time delivery rate
      const deliveredOrders = await prisma.delivery.findMany({
        where: {
          ...whereClause,
          status: 'DELIVERED',
          actualDeliveryDate: { not: null },
          estimatedDeliveryDate: { not: null }
        },
        select: {
          actualDeliveryDate: true,
          estimatedDeliveryDate: true
        }
      });
      
      const onTimeDeliveries = deliveredOrders.filter(
        delivery => delivery.actualDeliveryDate <= delivery.estimatedDeliveryDate
      ).length;
      
      const onTimeRate = deliveredOrders.length > 0 
        ? (onTimeDeliveries / deliveredOrders.length) * 100 
        : 0;
      
      // Get average delivery time
      const avgDeliveryTime = deliveredOrders.length > 0
        ? deliveredOrders.reduce((sum, delivery) => {
            const timeDiff = delivery.actualDeliveryDate - delivery.createdAt;
            return sum + timeDiff;
          }, 0) / deliveredOrders.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;
      
      // Get total deliveries
      const totalDeliveries = await prisma.delivery.count({ where: whereClause });
      
      res.json({
        totalDeliveries,
        statusBreakdown: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {}),
        onTimeDeliveryRate: Math.round(onTimeRate * 100) / 100,
        averageDeliveryTime: Math.round(avgDeliveryTime * 100) / 100,
        deliveredCount: deliveredOrders.length,
        onTimeCount: onTimeDeliveries
      });
    } catch (error) {
      console.error('Error fetching delivery metrics:', error);
      res.status(500).json({ error: 'Failed to fetch delivery metrics' });
    }
  }
};

module.exports = deliveryController;