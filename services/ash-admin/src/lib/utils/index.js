"use strict";
/**
 * Utility Functions Index
 * Centralized export for all utility functions
 *
 * Usage:
 * import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDuration = exports.calculatePercentage = exports.getInitials = exports.toTitleCase = exports.capitalize = exports.formatCount = exports.pluralize = exports.formatFileSize = exports.formatPhoneNumber = exports.truncateText = exports.formatPercentage = exports.formatNumber = exports.formatCurrency = exports.getIconColorClass = exports.getTrendIcon = exports.getEntityIcon = exports.getActionIcon = exports.getStatusIcon = exports.daysUntil = exports.isFuture = exports.isPast = exports.getDateRange = exports.getThisMonth = exports.getToday = exports.formatRelativeTime = exports.formatDate = exports.getChartColorPalette = exports.chartColors = exports.formatStatus = exports.getPriorityColor = exports.getSeverityColor = exports.getStatusColor = exports.priorityColors = exports.severityColors = exports.statusColors = void 0;
// Styling utilities
var styling_1 = require("./styling");
Object.defineProperty(exports, "statusColors", { enumerable: true, get: function () { return styling_1.statusColors; } });
Object.defineProperty(exports, "severityColors", { enumerable: true, get: function () { return styling_1.severityColors; } });
Object.defineProperty(exports, "priorityColors", { enumerable: true, get: function () { return styling_1.priorityColors; } });
Object.defineProperty(exports, "getStatusColor", { enumerable: true, get: function () { return styling_1.getStatusColor; } });
Object.defineProperty(exports, "getSeverityColor", { enumerable: true, get: function () { return styling_1.getSeverityColor; } });
Object.defineProperty(exports, "getPriorityColor", { enumerable: true, get: function () { return styling_1.getPriorityColor; } });
Object.defineProperty(exports, "formatStatus", { enumerable: true, get: function () { return styling_1.formatStatus; } });
Object.defineProperty(exports, "chartColors", { enumerable: true, get: function () { return styling_1.chartColors; } });
Object.defineProperty(exports, "getChartColorPalette", { enumerable: true, get: function () { return styling_1.getChartColorPalette; } });
// Date utilities
var date_1 = require("./date");
Object.defineProperty(exports, "formatDate", { enumerable: true, get: function () { return date_1.formatDate; } });
Object.defineProperty(exports, "formatRelativeTime", { enumerable: true, get: function () { return date_1.formatRelativeTime; } });
Object.defineProperty(exports, "getToday", { enumerable: true, get: function () { return date_1.getToday; } });
Object.defineProperty(exports, "getThisMonth", { enumerable: true, get: function () { return date_1.getThisMonth; } });
Object.defineProperty(exports, "getDateRange", { enumerable: true, get: function () { return date_1.getDateRange; } });
Object.defineProperty(exports, "isPast", { enumerable: true, get: function () { return date_1.isPast; } });
Object.defineProperty(exports, "isFuture", { enumerable: true, get: function () { return date_1.isFuture; } });
Object.defineProperty(exports, "daysUntil", { enumerable: true, get: function () { return date_1.daysUntil; } });
// Icon utilities
var icons_1 = require("./icons");
Object.defineProperty(exports, "getStatusIcon", { enumerable: true, get: function () { return icons_1.getStatusIcon; } });
Object.defineProperty(exports, "getActionIcon", { enumerable: true, get: function () { return icons_1.getActionIcon; } });
Object.defineProperty(exports, "getEntityIcon", { enumerable: true, get: function () { return icons_1.getEntityIcon; } });
Object.defineProperty(exports, "getTrendIcon", { enumerable: true, get: function () { return icons_1.getTrendIcon; } });
Object.defineProperty(exports, "getIconColorClass", { enumerable: true, get: function () { return icons_1.getIconColorClass; } });
// Format utilities
var format_1 = require("./format");
Object.defineProperty(exports, "formatCurrency", { enumerable: true, get: function () { return format_1.formatCurrency; } });
Object.defineProperty(exports, "formatNumber", { enumerable: true, get: function () { return format_1.formatNumber; } });
Object.defineProperty(exports, "formatPercentage", { enumerable: true, get: function () { return format_1.formatPercentage; } });
Object.defineProperty(exports, "truncateText", { enumerable: true, get: function () { return format_1.truncateText; } });
Object.defineProperty(exports, "formatPhoneNumber", { enumerable: true, get: function () { return format_1.formatPhoneNumber; } });
Object.defineProperty(exports, "formatFileSize", { enumerable: true, get: function () { return format_1.formatFileSize; } });
Object.defineProperty(exports, "pluralize", { enumerable: true, get: function () { return format_1.pluralize; } });
Object.defineProperty(exports, "formatCount", { enumerable: true, get: function () { return format_1.formatCount; } });
Object.defineProperty(exports, "capitalize", { enumerable: true, get: function () { return format_1.capitalize; } });
Object.defineProperty(exports, "toTitleCase", { enumerable: true, get: function () { return format_1.toTitleCase; } });
Object.defineProperty(exports, "getInitials", { enumerable: true, get: function () { return format_1.getInitials; } });
Object.defineProperty(exports, "calculatePercentage", { enumerable: true, get: function () { return format_1.calculatePercentage; } });
Object.defineProperty(exports, "formatDuration", { enumerable: true, get: function () { return format_1.formatDuration; } });
