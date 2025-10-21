"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

// Force dynamic rendering (prevent static generation during build)
export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Force light mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, []);

  // Check for token
  useEffect(() => {
    if (!token) {
      setError("No reset token provided");
    }
  }, [token]);

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push("at least 8 characters");
    if (!/[a-z]/.test(password)) errors.push("one lowercase letter");
    if (!/[A-Z]/.test(password)) errors.push("one uppercase letter");
    if (!/[0-9]/.test(password)) errors.push("one number");
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Client-side validation
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        throw new Error(`Password must have: ${passwordErrors.join(", ")}`);
      }

      if (!token) {
        throw new Error("No reset token provided");
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      setUserEmail(data.user?.email || "");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
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
              Password Reset Successful!
            </h2>
            <p className="mb-4 text-gray-700">
              Your password has been reset successfully.
            </p>
            {userEmail && (
              <p className="mb-6 text-sm text-gray-600">
                Account: <span className="font-semibold">{userEmail}</span>
              </p>
            )}

            <div className="mb-6 rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
              <p className="flex items-center justify-center gap-2 text-sm text-blue-800">
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting to login page...
              </p>
            </div>

            <button
              onClick={() => router.push("/login?reset=success")}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-corporate-blue py-3 font-semibold text-white shadow-corporate transition-all hover:bg-blue-700 hover:shadow-corporate-hover"
            >
              Go to Login Now
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-4"
        style={{ backgroundColor: "#F8FAFC", colorScheme: "light" }}
      >
        <div className="corporate-card w-full max-w-md p-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600">
              <XCircle className="h-10 w-10 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mb-6 text-gray-700">
              No reset token was provided. Please use the link from your email.
            </p>

            <Link
              href="/forgot-password"
              className="inline-block w-full rounded-lg bg-corporate-blue py-3 font-semibold text-white shadow-corporate transition-all hover:bg-blue-700 hover:shadow-corporate-hover"
            >
              Request New Reset Link
            </Link>
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
            <Lock className="h-7 w-7 text-white" />
          </div>

          <h1 className="mb-2 text-3xl font-bold" style={{ color: "#000000" }}>
            Reset Password
          </h1>
          <p className="text-base font-semibold" style={{ color: "#374151" }}>
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold"
              style={{ color: "#000000" }}
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3.5 pr-12 text-base font-medium placeholder-gray-500 transition-all focus:border-corporate-blue focus:outline-none focus:ring-2 focus:ring-corporate-blue"
                style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 transition-colors hover:text-gray-900"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Must be at least 8 characters with uppercase, lowercase, and
              number
            </p>
          </div>

          <div className="mb-6">
            <label
              className="mb-2 block text-sm font-bold"
              style={{ color: "#000000" }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3.5 pr-12 text-base font-medium placeholder-gray-500 transition-all focus:border-corporate-blue focus:outline-none focus:ring-2 focus:ring-corporate-blue"
                style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 transition-colors hover:text-gray-900"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
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
                Resetting Password...
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="border-t border-gray-200 pt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-semibold transition-colors"
            style={{ color: "#374151" }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
