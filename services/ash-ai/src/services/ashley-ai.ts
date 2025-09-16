import OpenAI from 'openai'
import { logger } from '@ash/shared/logger'
import { prisma } from '@ash/database'

export interface CapacityAnalysis {
  can_meet_deadline: boolean
  confidence: number
  bottlenecks: string[]
  recommendations: string[]
  estimated_completion: Date
}

export interface QualityPrediction {
  risk_level: 'low' | 'medium' | 'high'
  confidence: number
  risk_factors: string[]
  preventive_actions: string[]
}

export interface RouteValidation {
  is_valid: boolean
  issues: string[]
  optimizations: string[]
  estimated_time: number
}

export interface StockAlert {
  material: string
  current_level: number
  required_level: number
  days_until_stockout: number
  urgency: 'low' | 'medium' | 'high'
}

export class AshleyAI {
  private openai: OpenAI
  private isInitialized = false

  constructor() {
    if (!process.env.ASH_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    this.openai = new OpenAI({
      apiKey: process.env.ASH_OPENAI_API_KEY,
    })
  }

  async initialize(): Promise<void> {
    try {
      // Test OpenAI connection
      await this.openai.models.list()
      this.isInitialized = true
      logger.info('Ashley AI initialized with OpenAI GPT-4')
    } catch (error) {
      logger.error('Failed to initialize Ashley AI:', error)
      throw error
    }
  }

  async analyzeCapacityVsDeadline(
    orderId: string,
    workspaceId: string
  ): Promise<CapacityAnalysis> {
    if (!this.isInitialized) {
      throw new Error('Ashley AI not initialized')
    }

    try {
      // Fetch order details
      const order = await prisma.order.findFirst({
        where: { id: orderId, workspace_id: workspaceId },
        include: {
          line_items: true,
          routing_steps: {
            orderBy: { step_order: 'asc' }
          }
        }
      })

      if (!order) {
        throw new Error('Order not found')
      }

      // Fetch current production capacity
      const currentOrders = await prisma.order.count({
        where: {
          workspace_id: workspaceId,
          status: { in: ['confirmed', 'in_progress'] }
        }
      })

      // Calculate total quantity
      const totalQuantity = order.line_items.reduce((sum, item) => sum + item.quantity, 0)
      const totalSteps = order.routing_steps.length
      const estimatedHours = order.routing_steps.reduce((sum, step) => 
        sum + (step.estimated_hours?.toNumber() || 0), 0
      )

      // Prepare context for AI
      const context = `
      Order Analysis:
      - Order ID: ${order.order_number}
      - Total Quantity: ${totalQuantity} pieces
      - Delivery Date: ${order.delivery_date}
      - Production Steps: ${totalSteps}
      - Estimated Hours: ${estimatedHours}
      - Current Active Orders: ${currentOrders}
      - Days Until Delivery: ${order.delivery_date ? 
        Math.ceil((new Date(order.delivery_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 'No deadline set'}
      
      Production Methods Required:
      ${order.line_items.map(item => `- ${item.description}: ${item.printing_method || 'N/A'}`).join('\n')}
      
      Routing Steps:
      ${order.routing_steps.map(step => 
        `- ${step.step_name} (${step.department}): ${step.estimated_hours || 0}h`
      ).join('\n')}
      `

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are Ashley, an AI assistant specialized in apparel manufacturing analysis. 
            Analyze production capacity vs delivery deadlines. Consider equipment availability, 
            worker capacity, and production bottlenecks. Provide practical recommendations.
            
            Respond with a JSON object containing:
            - can_meet_deadline: boolean
            - confidence: number (0-100)
            - bottlenecks: array of potential bottleneck areas
            - recommendations: array of actionable recommendations
            - estimated_completion: estimated completion date (ISO string)
            `
          },
          {
            role: 'user',
            content: context
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const response = completion.choices[0].message.content
      if (!response) {
        throw new Error('No response from AI')
      }

      const analysis = JSON.parse(response) as CapacityAnalysis
      analysis.estimated_completion = new Date(analysis.estimated_completion)

      logger.info('Capacity analysis completed', {
        order_id: orderId,
        can_meet_deadline: analysis.can_meet_deadline,
        confidence: analysis.confidence
      })

      return analysis

    } catch (error) {
      logger.error('Capacity analysis failed:', error)
      throw error
    }
  }

  async predictQualityRisk(
    orderId: string,
    workspaceId: string
  ): Promise<QualityPrediction> {
    try {
      // Fetch order and historical quality data
      const [order, historicalDefects] = await Promise.all([
        prisma.order.findFirst({
          where: { id: orderId, workspace_id: workspaceId },
          include: {
            line_items: true,
            client: { select: { name: true } }
          }
        }),
        prisma.qcDefect.findMany({
          where: {
            workspace_id: workspaceId,
          },
          include: {
            inspection: {
              include: {
                bundle: {
                  include: {
                    order: {
                      include: {
                        line_items: true
                      }
                    }
                  }
                }
              }
            }
          },
          take: 100,
          orderBy: { created_at: 'desc' }
        })
      ])

      if (!order) {
        throw new Error('Order not found')
      }

      // Analyze historical patterns
      const printingMethods = order.line_items.map(item => item.printing_method).filter(Boolean)
      const garmentTypes = order.line_items.map(item => item.garment_type).filter(Boolean)

      const relatedDefects = historicalDefects.filter(defect => {
        const defectOrder = defect.inspection.bundle.order
        const defectMethods = defectOrder.line_items.map(item => item.printing_method)
        const defectGarments = defectOrder.line_items.map(item => item.garment_type)
        
        return printingMethods.some(method => defectMethods.includes(method)) ||
               garmentTypes.some(garment => defectGarments.includes(garment))
      })

      const context = `
      Quality Risk Assessment:
      - Order: ${order.order_number} for ${order.client.name}
      - Printing Methods: ${printingMethods.join(', ')}
      - Garment Types: ${garmentTypes.join(', ')}
      - Total Quantity: ${order.line_items.reduce((sum, item) => sum + item.quantity, 0)}
      
      Historical Quality Issues (similar orders):
      ${relatedDefects.slice(0, 10).map(defect => 
        `- ${defect.defect_type} (${defect.severity}): ${defect.description || 'No description'}`
      ).join('\n')}
      
      Defect Rate: ${relatedDefects.length > 0 ? 
        (relatedDefects.length / Math.max(historicalDefects.length, 1) * 100).toFixed(1) : 0}%
      `

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are Ashley, specializing in quality prediction for apparel manufacturing.
            Analyze historical defect patterns to predict quality risks for new orders.
            
            Respond with JSON:
            - risk_level: "low", "medium", or "high"
            - confidence: number (0-100)
            - risk_factors: array of identified risk factors
            - preventive_actions: array of recommended preventive measures
            `
          },
          {
            role: 'user',
            content: context
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      })

      const response = completion.choices[0].message.content
      if (!response) {
        throw new Error('No response from AI')
      }

      const prediction = JSON.parse(response) as QualityPrediction

      logger.info('Quality prediction completed', {
        order_id: orderId,
        risk_level: prediction.risk_level,
        confidence: prediction.confidence
      })

      return prediction

    } catch (error) {
      logger.error('Quality prediction failed:', error)
      throw error
    }
  }

  async validateProductionRoute(
    orderId: string,
    workspaceId: string
  ): Promise<RouteValidation> {
    try {
      const order = await prisma.order.findFirst({
        where: { id: orderId, workspace_id: workspaceId },
        include: {
          line_items: true,
          routing_steps: {
            orderBy: { step_order: 'asc' }
          }
        }
      })

      if (!order) {
        throw new Error('Order not found')
      }

      const context = `
      Route Validation:
      - Order: ${order.order_number}
      - Line Items: ${order.line_items.length}
      - Routing Steps: ${order.routing_steps.length}
      
      Production Requirements:
      ${order.line_items.map(item => 
        `- ${item.description} (${item.quantity} pcs, ${item.printing_method || 'N/A'})`
      ).join('\n')}
      
      Current Routing:
      ${order.routing_steps.map((step, index) => 
        `${index + 1}. ${step.step_name} (${step.department}) - ${step.estimated_hours || 0}h`
      ).join('\n')}
      `

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are Ashley, expert in apparel manufacturing routing optimization.
            Validate production routes for efficiency and correctness.
            
            Respond with JSON:
            - is_valid: boolean
            - issues: array of identified issues
            - optimizations: array of optimization suggestions
            - estimated_time: total estimated hours
            `
          },
          {
            role: 'user',
            content: context
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      })

      const response = completion.choices[0].message.content
      if (!response) {
        throw new Error('No response from AI')
      }

      const validation = JSON.parse(response) as RouteValidation

      logger.info('Route validation completed', {
        order_id: orderId,
        is_valid: validation.is_valid,
        issues_count: validation.issues.length
      })

      return validation

    } catch (error) {
      logger.error('Route validation failed:', error)
      throw error
    }
  }

  async generateStockAlerts(workspaceId: string): Promise<StockAlert[]> {
    try {
      // In a real implementation, this would analyze inventory levels
      // For now, return mock alerts
      const alerts: StockAlert[] = [
        {
          material: 'Cotton Fabric - White',
          current_level: 50,
          required_level: 200,
          days_until_stockout: 3,
          urgency: 'high'
        },
        {
          material: 'Polyester Thread - Black',
          current_level: 25,
          required_level: 100,
          days_until_stockout: 7,
          urgency: 'medium'
        }
      ]

      logger.info('Stock alerts generated', {
        workspace_id: workspaceId,
        alerts_count: alerts.length
      })

      return alerts

    } catch (error) {
      logger.error('Stock alerts generation failed:', error)
      throw error
    }
  }

  shutdown(): void {
    logger.info('Ashley AI shutting down')
    this.isInitialized = false
  }
}