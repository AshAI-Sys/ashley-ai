"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  // Force light mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset link");
      }

      setSuccess(true);
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-4"
        style={{ backgroundColor: "#F8FAFC", colorScheme: "light" }}
      >
        <div className="corporate-card w-full max-w-md p-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-600">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">
              Check Your Email
            </h2>
            <p className="mb-6 text-gray-700">
              If an account exists with <strong>{email}</strong>, you will
              receive a password reset link shortly.
            </p>

            <div className="mb-6 rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="text-left">
                  <p className="mb-1 text-sm font-bold text-blue-900">
                    Password Reset Email Sent
                  </p>
                  <p className="text-xs text-blue-800">
                    Please check your inbox and spam folder. The reset link will
                    expire in 1 hour.
                  </p>
                </div>
              </div>
            </div>

            {/* Show reset link for easy access */}
            {resetUrl && (
              <div className="mb-6 rounded-lg border-2 border-green-300 bg-green-50 p-4">
                <p className="mb-3 text-sm font-bold text-green-900">
                  ✅ Quick Reset Link
                </p>
                <p className="mb-3 text-xs text-gray-700">
                  Click the button below to reset your password instantly:
                </p>
                <a
                  href={resetUrl}
                  className="inline-block w-full rounded-lg bg-green-600 px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-green-700"
                >
                  Reset Password Now
                </a>
                <p className="mt-3 text-xs text-gray-600">
                  Or check your email inbox for the reset link.
                </p>
              </div>
            )}

            <button
              onClick={() => router.push("/login")}
              className="w-full rounded-lg bg-corporate-blue py-3 font-semibold text-white shadow-corporate transition-all hover:bg-blue-700 hover:shadow-corporate-hover"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "#F8FAFC", colorScheme: "light" }}
    >
      <div className="corporate-card w-full max-w-md p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-corporate-blue shadow-corporate">
            <Mail className="h-7 w-7 text-white" />
          </div>

          <h1 className="mb-2 text-3xl font-bold" style={{ color: "#000000" }}>
            Forgot Password?
          </h1>
          <p className="text-base font-semibold" style={{ color: "#374151" }}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-6">
            <label
              className="mb-2 block text-sm font-bold"
              style={{ color: "#000000" }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3.5 text-base font-medium placeholder-gray-500 transition-all focus:border-corporate-blue focus:outline-none focus:ring-2 focus:ring-corporate-blue"
              style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-lg py-3 text-sm font-semibold transition-all ${
              isLoading
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-corporate-blue text-white shadow-corporate hover:bg-blue-700 hover:shadow-corporate-hover"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending Reset Link...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="border-t border-gray-200 pt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
            style={{ color: "#374151" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
