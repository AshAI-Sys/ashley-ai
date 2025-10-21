// Ashley AI - PWA Utilities
// Progressive Web App helper functions

/**
 * Register the service worker
 */
export function registerServiceWorker(): void {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        console.log("[PWA] Service Worker registered:", registration.scope);

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log("[PWA] New version available! Please refresh.");
                // Show update notification to user
                showUpdateNotification();
              }
            });
          }
        });

        // Check for updates every hour
        setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000
        );
      } catch (error) {
        console.error("[PWA] Service Worker registration failed:", error);
      }
    });
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<void> {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log("[PWA] Service Worker unregistered");
  }
}

/**
 * Check if the app is running in standalone mode (PWA installed)
 */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

/**
 * Check if the app can be installed
 */
export function canInstall(): boolean {
  if (typeof window === "undefined") return false;

  // Check for beforeinstallprompt event support
  return "BeforeInstallPromptEvent" in window;
}

/**
 * Show update notification
 */
function showUpdateNotification(): void {
  // Create a custom event that components can listen to
  if (typeof window !== "undefined") {
    const event = new CustomEvent("pwa-update-available");
    window.dispatchEvent(event);
  }
}

/**
 * Check if the device is online
 */
export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

/**
 * Add online/offline listeners
 */
export function addConnectionListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);

  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
}

/**
 * Request permission for push notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("[PWA] Push notifications not supported");
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    const permission = await requestNotificationPermission();

    if (permission !== "granted") {
      console.warn("[PWA] Notification permission denied");
      return null;
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

      if (!vapidPublicKey) {
        console.warn("[PWA] VAPID public key not configured");
        return null;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log("[PWA] Push subscription created:", subscription.endpoint);

      // Send subscription to server
      await sendSubscriptionToServer(subscription);
    }

    return subscription;
  } catch (error) {
    console.error("[PWA] Failed to subscribe to push notifications:", error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    if (!("serviceWorker" in navigator)) return false;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log("[PWA] Push subscription removed");

      // Remove subscription from server
      await removeSubscriptionFromServer(subscription);
      return true;
    }

    return false;
  } catch (error) {
    console.error(
      "[PWA] Failed to unsubscribe from push notifications:",
      error
    );
    return false;
  }
}

/**
 * Register background sync
 */
export async function registerBackgroundSync(tag: string): Promise<void> {
  try {
    if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
      console.warn("[PWA] Background sync not supported");
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    if ("sync" in registration) {
      await (registration as any).sync.register(tag);
      console.log(`[PWA] Background sync registered: ${tag}`);
    }
  } catch (error) {
    console.error("[PWA] Failed to register background sync:", error);
  }
}

/**
 * Save data for offline use
 */
export async function saveOfflineData(key: string, data: any): Promise<void> {
  try {
    if (!("indexedDB" in window)) {
      console.warn("[PWA] IndexedDB not supported");
      return;
    }

    const db = await openDatabase();
    const transaction = db.transaction(["offlineData"], "readwrite");
    const store = transaction.objectStore("offlineData");

    await new Promise((resolve, reject) => {
      const request = store.put({ key, data, timestamp: Date.now() });
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });

    console.log(`[PWA] Offline data saved: ${key}`);
  } catch (error) {
    console.error("[PWA] Failed to save offline data:", error);
  }
}

/**
 * Get offline data
 */
export async function getOfflineData(key: string): Promise<any | null> {
  try {
    if (!("indexedDB" in window)) return null;

    const db = await openDatabase();
    const transaction = db.transaction(["offlineData"], "readonly");
    const store = transaction.objectStore("offlineData");

    return await new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("[PWA] Failed to get offline data:", error);
    return null;
  }
}

/**
 * Save pending order for background sync
 */
export async function savePendingOrder(orderData: any): Promise<void> {
  try {
    if (!("indexedDB" in window)) {
      console.warn("[PWA] IndexedDB not supported");
      return;
    }

    const db = await openDatabase();
    const transaction = db.transaction(["pendingOrders"], "readwrite");
    const store = transaction.objectStore("pendingOrders");

    await new Promise((resolve, reject) => {
      const request = store.add({
        data: orderData,
        timestamp: Date.now(),
        synced: false,
      });
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });

    console.log("[PWA] Pending order saved for sync");

    // Register background sync
    await registerBackgroundSync("sync-orders");
  } catch (error) {
    console.error("[PWA] Failed to save pending order:", error);
  }
}

// Helper functions

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ashley-ai-offline", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("pendingOrders")) {
        db.createObjectStore("pendingOrders", {
          keyPath: "id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("offlineData")) {
        db.createObjectStore("offlineData", { keyPath: "key" });
      }
    };
  });
}

async function sendSubscriptionToServer(
  subscription: PushSubscription
): Promise<void> {
  try {
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
  } catch (error) {
    console.error("[PWA] Failed to send subscription to server:", error);
  }
}

async function removeSubscriptionFromServer(
  subscription: PushSubscription
): Promise<void> {
  try {
    await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  } catch (error) {
    console.error("[PWA] Failed to remove subscription from server:", error);
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
