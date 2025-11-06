"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const createDemoAccount = async () => {
    setStatus("loading");
    setMessage("Creating demo account...");

    try {
      const response = await fetch("/api/seed-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        setCredentials(data.credentials);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to create demo account");
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Network error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Ashley AI Setup</h1>
          <p className="text-gray-600">One-click demo account creation</p>
        </div>

        {status === "idle" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                Click the button below to create a demo account for testing.
              </p>
            </div>
            <Button
              onClick={createDemoAccount}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Create Demo Account
            </Button>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === "success" && credentials && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="mb-3 text-center font-semibold text-green-800">{message}</p>
              <div className="space-y-2 rounded bg-white p-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <p className="font-mono text-sm text-gray-900">{credentials.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Password:</span>
                  <p className="font-mono text-sm text-gray-900">{credentials.password}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Go to Login
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-center text-red-800">{message}</p>
            </div>
            <Button
              onClick={() => {
                setStatus("idle");
                setMessage("");
              }}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Try Again
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
