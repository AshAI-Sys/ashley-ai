/**
 * Register the service worker
 */
export declare function registerServiceWorker(): void;
/**
 * Unregister the service worker
 */
export declare function unregisterServiceWorker(): Promise<void>;
/**
 * Check if the app is running in standalone mode (PWA installed)
 */
export declare function isStandalone(): boolean;
/**
 * Check if the app can be installed
 */
export declare function canInstall(): boolean;
/**
 * Check if the device is online
 */
export declare function isOnline(): boolean;
/**
 * Add online/offline listeners
 */
export declare function addConnectionListeners(onOnline: () => void, onOffline: () => void): () => void;
/**
 * Request permission for push notifications
 */
export declare function requestNotificationPermission(): Promise<NotificationPermission>;
/**
 * Subscribe to push notifications
 */
export declare function subscribeToPushNotifications(): Promise<PushSubscription | null>;
/**
 * Unsubscribe from push notifications
 */
export declare function unsubscribeFromPushNotifications(): Promise<boolean>;
/**
 * Register background sync
 */
export declare function registerBackgroundSync(tag: string): Promise<void>;
/**
 * Save data for offline use
 */
export declare function saveOfflineData(key: string, data: any): Promise<void>;
/**
 * Get offline data
 */
export declare function getOfflineData(key: string): Promise<any | null>;
/**
 * Save pending order for background sync
 */
export declare function savePendingOrder(orderData: any): Promise<void>;
