"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isStandalone } from "@/lib/pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsInstalled(isStandalone());

    // Check if user dismissed prompt before
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed =
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();

      // Store the event so we can trigger it later
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show our custom prompt immediately (no delay to avoid browser warnings)
      // The banner won't show until user interacts with the page anyway
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log("[PWA] App installed successfully");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("[PWA] User accepted the install prompt");
    } else {
      console.log("[PWA] User dismissed the install prompt");
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", new Date().toISOString());
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Sheet */}
      <div className="animate-slide-up fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="border-t border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="px-4 py-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                  Install Ashley AI
                </h3>
                <p className="mb-3 text-xs text-gray-600 dark:text-gray-500">
                  Add to your home screen for quick access and offline use
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Install
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    size="sm"
                    variant="ghost"
                    className="flex-shrink-0"
                  >
                    Not now
                  </Button>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-600 dark:hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Banner */}
      <div className="animate-slide-up fixed bottom-4 right-4 z-50 hidden max-w-sm lg:block">
        <div className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                  Install Ashley AI
                </h3>
                <p className="mb-3 text-xs text-gray-600 dark:text-gray-500">
                  Install as an app for better performance and offline access
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Install Now
                  </Button>
                  <Button onClick={handleDismiss} size="sm" variant="outline">
                    Maybe Later
                  </Button>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-600 dark:hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
