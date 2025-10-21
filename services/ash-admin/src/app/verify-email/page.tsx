"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";

// Force dynamic rendering (prevent static generation during build)
export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "verifying" | "success" | "error" | "expired"
  >("verifying");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // FORCE LIGHT MODE
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setMessage(data.message);
        setUserEmail(data.user?.email || "");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 3000);
      } else {
        if (data.expired) {
          setStatus("expired");
        } else {
          setStatus("error");
        }
        setMessage(data.error || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during verification");
      console.error("Verification error:", error);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setResending(true);
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendMessage(
          "✅ Verification email sent! Please check your inbox."
        );
        setResendEmail("");

        // Show development URL if available
        if (data.verificationUrl) {
          console.log("🔗 Verification URL:", data.verificationUrl);
        }
      } else {
        setResendMessage(
          `❌ ${data.error || "Failed to send verification email"}`
        );
      }
    } catch (error) {
      setResendMessage("❌ An error occurred. Please try again.");
      console.error("Resend error:", error);
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4"
      style={{ colorScheme: "light" }}
    >
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <Mail className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              Email Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ashley AI Admin Portal
            </p>
          </div>

          {/* Verifying State */}
          {status === "verifying" && (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Verifying your email...
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Please wait a moment
              </p>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="py-8 text-center">
              <div className="mb-4 flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Email Verified!
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">{message}</p>
              {userEmail && (
                <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                  Account: <span className="font-medium">{userEmail}</span>
                </p>
              )}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="flex items-center justify-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting to login page...
                </p>
              </div>
              <button
                onClick={() => router.push("/login?verified=true")}
                className="mx-auto mt-4 flex items-center justify-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Go to login now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="py-8 text-center">
              <div className="mb-4 flex justify-center">
                <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Verification Failed
              </h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">{message}</p>
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-300">
                  The verification link may be invalid or has already been used.
                </p>
              </div>

              {/* Resend Form */}
              <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Need a new verification link?
                </p>
                <form onSubmit={handleResendVerification} className="space-y-4">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={e => setResendEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={resending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                </form>
                {resendMessage && (
                  <p className="mt-3 text-center text-sm">{resendMessage}</p>
                )}
              </div>
            </div>
          )}

          {/* Expired State */}
          {status === "expired" && (
            <div className="py-8 text-center">
              <div className="mb-4 flex justify-center">
                <XCircle className="h-16 w-16 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Link Expired
              </h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">{message}</p>
              <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  Verification links are valid for 24 hours.
                </p>
              </div>

              {/* Resend Form */}
              <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Request a new verification link:
                </p>
                <form onSubmit={handleResendVerification} className="space-y-4">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={e => setResendEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={resending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Get New Verification Link
                      </>
                    )}
                  </button>
                </form>
                {resendMessage && (
                  <p className="mt-3 text-center text-sm">{resendMessage}</p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 border-t border-gray-200 pt-6 text-center dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Back to login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
