/**
 * Utility Functions Index
 * Centralized export for all utility functions
 *
 * Usage:
 * import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
 */

// Styling utilities
export {
  statusColors,
  severityColors,
  priorityColors,
  getStatusColor,
  getSeverityColor,
  getPriorityColor,
  formatStatus,
  chartColors,
  getChartColorPalette,
} from './styling';

// Date utilities
export {
  formatDate,
  formatRelativeTime,
  getToday,
  getThisMonth,
  getDateRange,
  isPast,
  isFuture,
  daysUntil,
} from './date';

// Icon utilities
export {
  getStatusIcon,
  getActionIcon,
  getEntityIcon,
  getTrendIcon,
  getIconColorClass,
} from './icons';

// Format utilities
export {
  formatCurrency,
  formatNumber,
  formatPercentage,
  truncateText,
  formatPhoneNumber,
  formatFileSize,
  pluralize,
  formatCount,
  capitalize,
  toTitleCase,
  getInitials,
  calculatePercentage,
  formatDuration,
} from './format';
