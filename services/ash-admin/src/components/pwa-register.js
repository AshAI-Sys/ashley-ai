"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PWARegister;
const react_1 = require("react");
const pwa_1 = require("@/lib/pwa");
const react_hot_toast_1 = require("react-hot-toast");
function PWARegister() {
    const [isOnline, setIsOnline] = (0, react_1.useState)(true);
    const [updateAvailable, setUpdateAvailable] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Register service worker
        (0, pwa_1.registerServiceWorker)();
        // Set initial online status
        setIsOnline(navigator.onLine);
        // Listen for online/offline events
        const cleanup = (0, pwa_1.addConnectionListeners)(() => {
            setIsOnline(true);
            react_hot_toast_1.toast.success("Connection restored", {
                icon: "🌐",
                duration: 3000,
            });
        }, () => {
            setIsOnline(false);
            react_hot_toast_1.toast.error("You are offline", {
                icon: "📡",
                duration: 5000,
            });
        });
        // Listen for PWA update available
        const handleUpdateAvailable = () => {
            setUpdateAvailable(true);
            (0, react_hot_toast_1.toast)(t => (<div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-medium">Update Available</div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-500">
                A new version of Ashley AI is available
              </div>
            </div>
            <button onClick={() => {
                    react_hot_toast_1.toast.dismiss(t.id);
                    window.location.reload();
                }} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              Refresh
            </button>
          </div>), {
                duration: Infinity,
                icon: "🔄",
            });
        };
        window.addEventListener("pwa-update-available", handleUpdateAvailable);
        return () => {
            cleanup();
            window.removeEventListener("pwa-update-available", handleUpdateAvailable);
        };
    }, []);
    // This component doesn't render anything
    return null;
}
