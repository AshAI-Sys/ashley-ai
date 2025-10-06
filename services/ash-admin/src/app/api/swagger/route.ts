import { NextResponse } from 'next/server'

/**
 * OpenAPI 3.0 Specification for Ashley AI Manufacturing ERP
 */
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Ashley AI Manufacturing ERP API',
    version: '1.0.0',
    description: 'Complete Manufacturing ERP System with 15 Production Stages',
    contact: {
      name: 'Ashley AI Support',
      email: 'support@ashleyai.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001/api',
      description: 'Development server'
    },
    {
      url: 'https://your-domain.com/api',
      description: 'Production server'
    }
  ],
  tags: [
    { name: 'Authentication', description: 'User authentication and authorization' },
    { name: 'Orders', description: 'Order management' },
    { name: 'Production', description: 'Production operations (Cutting, Printing, Sewing)' },
    { name: 'Quality Control', description: 'QC inspections and CAPA' },
    { name: 'Delivery', description: 'Shipment and delivery tracking' },
    { name: 'Finance', description: 'Invoices, payments, and financial reporting' },
    { name: 'HR & Payroll', description: 'Employee management and payroll' },
    { name: 'Analytics', description: 'Business intelligence and metrics' },
    { name: 'Email', description: 'Email notifications and queue management' },
    { name: 'Backup', description: 'Database backup and restore' }
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '401': { description: 'Invalid credentials' },
          '429': { description: 'Too many requests - account locked' }
        }
      }
    },
    '/analytics/metrics': {
      get: {
        tags: ['Analytics'],
        summary: 'Get all business metrics',
        parameters: [
          {
            name: 'workspace_id',
            in: 'query',
            schema: { type: 'string' },
            description: 'Workspace ID'
          }
        ],
        responses: {
          '200': {
            description: 'Metrics retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        production: { $ref: '#/components/schemas/ProductionMetrics' },
                        financial: { $ref: '#/components/schemas/FinancialMetrics' },
                        quality: { $ref: '#/components/schemas/QualityMetrics' },
                        employee: { $ref: '#/components/schemas/EmployeeMetrics' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/email/queue': {
      post: {
        tags: ['Email'],
        summary: 'Queue an email for delivery',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['order_confirmation', 'delivery_notification', 'invoice', 'security_alert']
                  },
                  to: { type: 'string', format: 'email' },
                  data: { type: 'object' },
                  scheduledFor: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Email queued successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    jobId: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER'] }
        }
      },
      ProductionMetrics: {
        type: 'object',
        properties: {
          total_orders: { type: 'number' },
          orders_in_production: { type: 'number' },
          total_pieces_produced: { type: 'number' },
          on_time_delivery_rate: { type: 'number' }
        }
      },
      FinancialMetrics: {
        type: 'object',
        properties: {
          total_revenue: { type: 'number' },
          revenue_this_month: { type: 'number' },
          outstanding_amount: { type: 'number' },
          profit_margin: { type: 'number' }
        }
      },
      QualityMetrics: {
        type: 'object',
        properties: {
          total_inspections: { type: 'number' },
          pass_rate: { type: 'number' },
          defect_rate: { type: 'number' }
        }
      },
      EmployeeMetrics: {
        type: 'object',
        properties: {
          total_employees: { type: 'number' },
          active_employees: { type: 'number' },
          attendance_rate: { type: 'number' }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{ bearerAuth: [] }]
}

export async function GET() {
  return NextResponse.json(openApiSpec)
}
