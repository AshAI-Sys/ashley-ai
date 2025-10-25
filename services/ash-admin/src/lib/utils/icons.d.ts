/**
 * Icon Utilities - Centralized icon mapping for consistent UI
 * Maps status, actions, and entity types to Lucide React icons
 */
import { type LucideIcon } from 'lucide-react';
/**
 * Get icon component for a given status
 * @param status - Status string (e.g., 'completed', 'pending')
 * @returns Lucide icon component
 */
export declare function getStatusIcon(status: string): LucideIcon;
/**
 * Get icon component for a given action type
 * @param action - Action string (e.g., 'create', 'edit', 'delete')
 * @returns Lucide icon component
 */
export declare function getActionIcon(action: string): LucideIcon;
/**
 * Get icon component for a given entity type
 * @param entityType - Entity type string (e.g., 'order', 'user', 'product')
 * @returns Lucide icon component
 */
export declare function getEntityIcon(entityType: string): LucideIcon;
/**
 * Get icon component for trends/metrics
 * @param trend - Trend direction ('up', 'down', 'neutral')
 * @returns Lucide icon component
 */
export declare function getTrendIcon(trend: 'up' | 'down' | 'neutral'): LucideIcon;
/**
 * Get icon color classes based on status
 * @param status - Status string
 * @returns Tailwind CSS color classes
 */
export declare function getIconColorClass(status: string): string;
