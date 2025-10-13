/**
 * Shared TypeScript Types for API Responses
 *
 * This file contains all shared types used across the application for API responses,
 * requests, and data structures. This ensures type safety and consistency.
 */

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard successful API response
 */
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

/**
 * Standard error API response
 */
export interface ApiErrorResponse {
  success: false
  error: string
  details?: any
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

/**
 * API response with pagination
 */
export type ApiPaginatedResponse<T> = ApiSuccessResponse<PaginatedResponse<T>>

// ============================================================================
// Common Entity Types
// ============================================================================

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string
  created_at: string | Date
  updated_at: string | Date
}

/**
 * Entity with workspace
 */
export interface WorkspaceEntity extends BaseEntity {
  workspace_id: string
}

/**
 * Entity with soft delete
 */
export interface SoftDeletableEntity extends BaseEntity {
  deleted_at: string | Date | null
}

// ============================================================================
// Order Related Types
// ============================================================================

export type OrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'in_production'
  | 'completed'
  | 'cancelled'

export interface OrderLineItem extends WorkspaceEntity {
  order_id: string
  sku: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  printing_method: string | null
  garment_type: string | null
  size_breakdown: any // JSON
  metadata: any // JSON
}

export interface Order extends WorkspaceEntity, SoftDeletableEntity {
  order_number: string
  client_id: string
  brand_id: string | null
  po_number: string | null
  order_type: string | null
  status: OrderStatus
  total_amount: number
  currency: string
  delivery_date: string | Date | null
  notes: string | null
  design_name: string | null
  fabric_type: string | null
  mockup_url: string | null
  size_distribution: string | null
  metadata: any // JSON
}

export interface OrderWithRelations extends Order {
  client: Client
  brand?: Brand
  line_items: OrderLineItem[]
  _count?: {
    line_items: number
    design_assets: number
    invoices: number
  }
}

// ============================================================================
// Client Related Types
// ============================================================================

export interface Client extends WorkspaceEntity, SoftDeletableEntity {
  name: string
  contact_person: string
  email: string
  phone: string
  address: string | null
  tax_id: string | null
  payment_terms: number | null
  credit_limit: number | null
  is_active: boolean
  portal_settings: any // JSON
}

export interface ClientWithRelations extends Client {
  brands?: Brand[]
  orders?: Order[]
  _count?: {
    orders: number
    brands: number
  }
}

// ============================================================================
// Brand Related Types
// ============================================================================

export interface Brand extends WorkspaceEntity, SoftDeletableEntity {
  client_id: string
  name: string
  code: string
  logo_url: string | null
  settings: any // JSON
  is_active: boolean
}

// ============================================================================
// Delivery Related Types
// ============================================================================

export type ShipmentStatus =
  | 'pending'
  | 'confirmed'
  | 'ready_for_pickup'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'failed'

export type DeliveryMethod =
  | 'DRIVER'
  | 'LALAMOVE'
  | 'GRAB'
  | 'JNT'
  | 'LBC'
  | 'NINJAVAN'
  | 'DHL'

export interface Shipment extends WorkspaceEntity {
  order_id: string
  tracking_number: string
  status: ShipmentStatus
  method: DeliveryMethod
  consignee_name: string
  consignee_phone: string
  consignee_address: string
  estimated_delivery_date: string | Date | null
  actual_delivery_date: string | Date | null
  eta: string | Date | null
  notes: string | null
}

export interface DeliveryStats {
  overview: {
    total_deliveries: number
    deliveries_this_month: number
    deliveries_this_week: number
    pending_shipments: number
    in_transit_shipments: number
    failed_shipments: number
  }
  performance: {
    on_time_rate: number
    avg_delivery_days: number
    total_delivered: number
    on_time_deliveries: number
    late_deliveries: number
  }
  status_breakdown: Record<ShipmentStatus, number>
  geographic_distribution?: {
    location: string
    shipments: number
    percentage: number
  }[]
  method_performance?: {
    method: DeliveryMethod
    total_shipments: number
    delivered: number
    success_rate: number
    avg_delivery_time: number
  }[]
}

// ============================================================================
// Finance Related Types
// ============================================================================

export type InvoiceStatus =
  | 'draft'
  | 'pending'
  | 'sent'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'cancelled'

export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'credit_card'
  | 'check'
  | 'online_payment'

export interface Invoice extends WorkspaceEntity {
  order_id: string | null
  invoice_number: string
  status: InvoiceStatus
  total_amount: number
  currency: string
  due_date: string | Date
  paid_amount: number
  balance: number
  notes: string | null
}

export interface Payment extends WorkspaceEntity {
  invoice_id: string
  amount: number
  currency: string
  payment_method: PaymentMethod
  payment_date: string | Date
  reference_number: string | null
  notes: string | null
}

// ============================================================================
// HR & Payroll Related Types
// ============================================================================

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated'

export type SalaryType = 'DAILY' | 'HOURLY' | 'PIECE' | 'MONTHLY'

export interface Employee extends WorkspaceEntity {
  employee_number: string
  first_name: string
  last_name: string
  email: string
  phone: string
  position: string
  department: string
  status: EmployeeStatus
  salary_type: SalaryType
  salary_amount: number
  hire_date: string | Date
}

export interface AttendanceLog extends WorkspaceEntity {
  employee_id: string
  date: string | Date
  time_in: string | Date | null
  time_out: string | Date | null
  break_duration: number
  overtime_hours: number
  status: string
  notes: string | null
}

// ============================================================================
// Merchandising AI Types
// ============================================================================

export type ForecastStatus = 'pending' | 'active' | 'expired' | 'archived'

export type RecommendationType = 'cross-sell' | 'up-sell' | 'reorder' | 'trending'

export type TrendType = 'seasonal' | 'fashion' | 'color' | 'category' | 'demand'

export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'

export interface DemandForecast extends WorkspaceEntity {
  product_id: string
  product_name: string
  forecast_period: string
  predicted_demand: number
  confidence_score: number
  seasonal_factor: number
  trend_factor: number
  status: ForecastStatus
  forecast_date: string | Date
}

export interface ProductRecommendation extends WorkspaceEntity {
  type: RecommendationType
  product_id: string
  product_name: string
  recommended_product_id: string
  recommended_product_name: string
  confidence_score: number
  reason: string
  impact_score: number
}

export interface MarketTrend extends WorkspaceEntity {
  trend_type: TrendType
  category: string
  description: string
  impact_score: number
  confidence_level: ConfidenceLevel
  start_date: string | Date
  end_date: string | Date | null
  trend_data: any // JSON
  status: string
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateOrderRequest {
  clientId: string
  brandId?: string
  orderNumber?: string
  status?: OrderStatus
  totalAmount: number
  currency?: string
  deliveryDate?: string
  notes?: string
  lineItems?: Partial<OrderLineItem>[]
  po_number?: string
  order_type?: string
  design_name?: string
  fabric_type?: string
  size_distribution?: string
  mockup_url?: string
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  id: string
}

export interface CreateClientRequest {
  name: string
  company?: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string | object
  tax_id?: string
  payment_terms?: number
  credit_limit?: number
  is_active?: boolean
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: string
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface SearchParams extends PaginationParams {
  search?: string
}

export interface OrderQueryParams extends SearchParams {
  status?: OrderStatus
  clientId?: string
  startDate?: string
  endDate?: string
}

export interface ClientQueryParams extends SearchParams {
  is_active?: boolean
}

export interface DeliveryQueryParams extends SearchParams {
  status?: ShipmentStatus
  method?: DeliveryMethod
  startDate?: string
  endDate?: string
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Extract the data type from an API response
 */
export type ExtractData<T> = T extends ApiSuccessResponse<infer D> ? D : never

/**
 * Type guard for successful API response
 */
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true
}

/**
 * Type guard for error API response
 */
export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false
}

/**
 * Type guard for paginated response
 */
export function isPaginatedResponse<T>(
  data: any
): data is PaginatedResponse<T> {
  return (
    data &&
    typeof data === 'object' &&
    'items' in data &&
    'pagination' in data &&
    Array.isArray(data.items)
  )
}
