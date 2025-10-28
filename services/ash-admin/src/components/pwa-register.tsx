"use client";

import { useEffect, useState } from "react";
import { registerServiceWorker, addConnectionListeners } from "@/lib/pwa";
import { toast } from "react-hot-toast";

export default function PWARegister() {
  const [_isOnline, setIsOnline] = useState(true);
  const [_updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Set initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const cleanup = addConnectionListeners(
      () => {
        setIsOnline(true);
        toast.success("Connection restored", {
          icon: "🌐",
          duration: 3000,
        });
      },
      () => {
        setIsOnline(false);
        toast.error("You are offline", {
          icon: "📡",
          duration: 5000,
        });
      }
    );

    // Listen for PWA update available
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
      toast(
        t => (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-medium">Update Available</div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-500">
                A new version of Ashley AI is available
              </div>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                window.location.reload();
              }}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        ),
        {
          duration: Infinity,
          icon: "🔄",
        }
      );
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
