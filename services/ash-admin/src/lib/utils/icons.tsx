/**
 * Icon Utilities - Centralized icon mapping for consistent UI
 * Maps status, actions, and entity types to Lucide React icons
 */

import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Package,
  Users,
  Settings,
  Trash2,
  Edit,
  Eye,
  Download,
  Upload,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Save,
  Send,
  Printer,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react';

/**
 * Get icon component for a given status
 * @param status - Status string (e.g., 'completed', 'pending')
 * @returns Lucide icon component
 */
export function getStatusIcon(status: string): LucideIcon {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');

  const statusIconMap: Record<string, LucideIcon> = {
    completed: CheckCircle,
    success: CheckCircle,
    confirmed: CheckCircle,
    active: CheckCircle,
    approved: CheckCircle,

    pending: Clock,
    pending_approval: Clock,
    in_progress: Clock,
    in_production: Clock,
    processing: Clock,

    cancelled: XCircle,
    rejected: XCircle,
    failed: XCircle,
    inactive: XCircle,
    disabled: XCircle,

    draft: FileText,
    warning: AlertCircle,
    alert: AlertCircle,
  };

  return statusIconMap[normalizedStatus] || FileText;
}

/**
 * Get icon component for a given action type
 * @param action - Action string (e.g., 'create', 'edit', 'delete')
 * @returns Lucide icon component
 */
export function getActionIcon(action: string): LucideIcon {
  const normalizedAction = action?.toLowerCase();

  const actionIconMap: Record<string, LucideIcon> = {
    create: Plus,
    add: Plus,
    new: Plus,

    edit: Edit,
    update: Edit,
    modify: Edit,

    delete: Trash2,
    remove: Trash2,

    view: Eye,
    show: Eye,
    details: Eye,

    download: Download,
    export: Download,

    upload: Upload,
    import: Upload,

    save: Save,
    submit: Send,
    send: Send,

    print: Printer,
    refresh: RefreshCw,
    reload: RefreshCw,

    next: ArrowRight,
    previous: ArrowLeft,
    back: ArrowLeft,

    approve: CheckCircle,
    reject: XCircle,
    cancel: XCircle,
  };

  return actionIconMap[normalizedAction] || FileText;
}

/**
 * Get icon component for a given entity type
 * @param entityType - Entity type string (e.g., 'order', 'user', 'product')
 * @returns Lucide icon component
 */
export function getEntityIcon(entityType: string): LucideIcon {
  const normalized = entityType?.toLowerCase();

  const entityIconMap: Record<string, LucideIcon> = {
    order: Package,
    orders: Package,
    product: Package,
    products: Package,
    inventory: Package,

    user: Users,
    users: Users,
    employee: Users,
    employees: Users,
    client: Users,
    clients: Users,

    settings: Settings,
    configuration: Settings,
    preferences: Settings,

    document: FileText,
    file: FileText,
    report: FileText,

    email: Mail,
    phone: Phone,
    contact: Phone,

    location: MapPin,
    address: MapPin,

    calendar: Calendar,
    schedule: Calendar,
    event: Calendar,

    payment: DollarSign,
    invoice: DollarSign,
    transaction: DollarSign,
    finance: DollarSign,
  };

  return entityIconMap[normalized] || FileText;
}

/**
 * Get icon component for trends/metrics
 * @param trend - Trend direction ('up', 'down', 'neutral')
 * @returns Lucide icon component
 */
export function getTrendIcon(trend: 'up' | 'down' | 'neutral'): LucideIcon {
  const trendIconMap: Record<string, LucideIcon> = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: RefreshCw,
  };

  return trendIconMap[trend] || RefreshCw;
}

/**
 * Get icon color classes based on status
 * @param status - Status string
 * @returns Tailwind CSS color classes
 */
export function getIconColorClass(status: string): string {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');

  const iconColorMap: Record<string, string> = {
    completed: 'text-green-600',
    success: 'text-green-600',
    confirmed: 'text-green-600',
    active: 'text-green-600',

    pending: 'text-yellow-600',
    pending_approval: 'text-yellow-600',
    in_progress: 'text-purple-600',
    in_production: 'text-purple-600',

    cancelled: 'text-red-600',
    rejected: 'text-red-600',
    failed: 'text-red-600',
    inactive: 'text-gray-600',

    draft: 'text-gray-600',
    warning: 'text-yellow-600',
    alert: 'text-red-600',
  };

  return iconColorMap[normalizedStatus] || 'text-gray-600';
}
