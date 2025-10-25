"use strict";
/**
 * Icon Utilities - Centralized icon mapping for consistent UI
 * Maps status, actions, and entity types to Lucide React icons
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusIcon = getStatusIcon;
exports.getActionIcon = getActionIcon;
exports.getEntityIcon = getEntityIcon;
exports.getTrendIcon = getTrendIcon;
exports.getIconColorClass = getIconColorClass;
const lucide_react_1 = require("lucide-react");
/**
 * Get icon component for a given status
 * @param status - Status string (e.g., 'completed', 'pending')
 * @returns Lucide icon component
 */
function getStatusIcon(status) {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');
    const statusIconMap = {
        completed: lucide_react_1.CheckCircle,
        success: lucide_react_1.CheckCircle,
        confirmed: lucide_react_1.CheckCircle,
        active: lucide_react_1.CheckCircle,
        approved: lucide_react_1.CheckCircle,
        pending: lucide_react_1.Clock,
        pending_approval: lucide_react_1.Clock,
        in_progress: lucide_react_1.Clock,
        in_production: lucide_react_1.Clock,
        processing: lucide_react_1.Clock,
        cancelled: lucide_react_1.XCircle,
        rejected: lucide_react_1.XCircle,
        failed: lucide_react_1.XCircle,
        inactive: lucide_react_1.XCircle,
        disabled: lucide_react_1.XCircle,
        draft: lucide_react_1.FileText,
        warning: lucide_react_1.AlertCircle,
        alert: lucide_react_1.AlertCircle,
    };
    return statusIconMap[normalizedStatus] || lucide_react_1.FileText;
}
/**
 * Get icon component for a given action type
 * @param action - Action string (e.g., 'create', 'edit', 'delete')
 * @returns Lucide icon component
 */
function getActionIcon(action) {
    const normalizedAction = action?.toLowerCase();
    const actionIconMap = {
        create: lucide_react_1.Plus,
        add: lucide_react_1.Plus,
        new: lucide_react_1.Plus,
        edit: lucide_react_1.Edit,
        update: lucide_react_1.Edit,
        modify: lucide_react_1.Edit,
        delete: lucide_react_1.Trash2,
        remove: lucide_react_1.Trash2,
        view: lucide_react_1.Eye,
        show: lucide_react_1.Eye,
        details: lucide_react_1.Eye,
        download: lucide_react_1.Download,
        export: lucide_react_1.Download,
        upload: lucide_react_1.Upload,
        import: lucide_react_1.Upload,
        save: lucide_react_1.Save,
        submit: lucide_react_1.Send,
        send: lucide_react_1.Send,
        print: lucide_react_1.Printer,
        refresh: lucide_react_1.RefreshCw,
        reload: lucide_react_1.RefreshCw,
        next: lucide_react_1.ArrowRight,
        previous: lucide_react_1.ArrowLeft,
        back: lucide_react_1.ArrowLeft,
        approve: lucide_react_1.CheckCircle,
        reject: lucide_react_1.XCircle,
        cancel: lucide_react_1.XCircle,
    };
    return actionIconMap[normalizedAction] || lucide_react_1.FileText;
}
/**
 * Get icon component for a given entity type
 * @param entityType - Entity type string (e.g., 'order', 'user', 'product')
 * @returns Lucide icon component
 */
function getEntityIcon(entityType) {
    const normalized = entityType?.toLowerCase();
    const entityIconMap = {
        order: lucide_react_1.Package,
        orders: lucide_react_1.Package,
        product: lucide_react_1.Package,
        products: lucide_react_1.Package,
        inventory: lucide_react_1.Package,
        user: lucide_react_1.Users,
        users: lucide_react_1.Users,
        employee: lucide_react_1.Users,
        employees: lucide_react_1.Users,
        client: lucide_react_1.Users,
        clients: lucide_react_1.Users,
        settings: lucide_react_1.Settings,
        configuration: lucide_react_1.Settings,
        preferences: lucide_react_1.Settings,
        document: lucide_react_1.FileText,
        file: lucide_react_1.FileText,
        report: lucide_react_1.FileText,
        email: lucide_react_1.Mail,
        phone: lucide_react_1.Phone,
        contact: lucide_react_1.Phone,
        location: lucide_react_1.MapPin,
        address: lucide_react_1.MapPin,
        calendar: lucide_react_1.Calendar,
        schedule: lucide_react_1.Calendar,
        event: lucide_react_1.Calendar,
        payment: lucide_react_1.DollarSign,
        invoice: lucide_react_1.DollarSign,
        transaction: lucide_react_1.DollarSign,
        finance: lucide_react_1.DollarSign,
    };
    return entityIconMap[normalized] || lucide_react_1.FileText;
}
/**
 * Get icon component for trends/metrics
 * @param trend - Trend direction ('up', 'down', 'neutral')
 * @returns Lucide icon component
 */
function getTrendIcon(trend) {
    const trendIconMap = {
        up: lucide_react_1.TrendingUp,
        down: lucide_react_1.TrendingDown,
        neutral: lucide_react_1.RefreshCw,
    };
    return trendIconMap[trend] || lucide_react_1.RefreshCw;
}
/**
 * Get icon color classes based on status
 * @param status - Status string
 * @returns Tailwind CSS color classes
 */
function getIconColorClass(status) {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');
    const iconColorMap = {
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
