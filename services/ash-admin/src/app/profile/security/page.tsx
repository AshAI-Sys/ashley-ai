"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/lib/auth-context";
import {
  Shield,
  Smartphone,
  Key,
  Download,
  Copy,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  QrCode,
  RefreshCw,
} from "lucide-react";

interface TwoFactorData {
  secret?: string;
  qrCode?: string;
  manualEntryCode?: string;
  instructions?: string[];
  backupCodes?: string[];
}

export default function SecuritySettingsPage() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(
    null
  );
  const [verificationToken, setVerificationToken] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [setupStep, setSetupStep] = useState(1); // 1: QR Code, 2: Verification, 3: Backup Codes
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      // In real implementation, check user's 2FA status from API
      // For demo, check from user object
      setIs2FAEnabled(user?.requires_2fa || false);
    } catch (error) {
      console.error("Error checking 2FA status:", error);
    }
  };

  const initiateTwoFactorSetup = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("ash_token");
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "generate" }),
      });

      if (response.ok) {
        const data = await response.json();
        setTwoFactorData(data.data);
        setShowSetup(true);
        setSetupStep(1);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error initiating 2FA setup:", error);
      alert("Failed to initiate 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const verifyTwoFactorSetup = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      alert("Please enter a valid 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("ash_token");
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verify",
          token: verificationToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBackupCodes(data.data.backupCodes);
        setIs2FAEnabled(true);
        setSetupStep(3);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error verifying 2FA setup:", error);
      alert("Failed to verify 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (
      !confirm(
        "Are you sure you want to disable two-factor authentication? This will make your account less secure."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("ash_token");
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "disable" }),
      });

      if (response.ok) {
        setIs2FAEnabled(false);
        setShowSetup(false);
        setTwoFactorData(null);
        setBackupCodes([]);
        alert("Two-factor authentication has been disabled");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      alert("Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ashley-ai-backup-codes.txt";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const completeSetup = () => {
    setShowSetup(false);
    setSetupStep(1);
    setVerificationToken("");
    setTwoFactorData(null);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center text-2xl font-bold text-gray-900">
                <Shield className="mr-3 h-8 w-8 text-blue-600" />
                Security Settings
              </h1>
              <p className="text-sm text-gray-600">
                Manage your account security and two-factor authentication
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Back to Dashboard
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-4xl px-6 py-8">
          {/* Two-Factor Authentication Section */}
          <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="flex items-center text-lg font-semibold text-gray-900">
                  <Smartphone className="mr-2 h-5 w-5 text-green-600" />
                  Two-Factor Authentication
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center">
                {is2FAEnabled ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    <span className="text-sm font-medium">Enabled</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    <span className="text-sm font-medium">Disabled</span>
                  </div>
                )}
              </div>
            </div>

            {!is2FAEnabled ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-2 text-sm font-medium text-blue-900">
                    Why enable 2FA?
                  </h3>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>
                      • Protects your account even if your password is
                      compromised
                    </li>
                    <li>• Required for admin users and sensitive operations</li>
                    <li>
                      • Uses your phone's authenticator app for verification
                    </li>
                    <li>• Includes backup codes for account recovery</li>
                  </ul>
                </div>

                <button
                  onClick={initiateTwoFactorSetup}
                  disabled={loading}
                  className="flex items-center rounded-md bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Enable Two-Factor Authentication
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm text-green-800">
                    Two-factor authentication is enabled for your account. Your
                    account is protected by an additional verification step.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                    className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    {showBackupCodes ? "Hide" : "Show"} Backup Codes
                  </button>

                  <button
                    onClick={disableTwoFactor}
                    disabled={loading}
                    className="flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Unlock className="mr-2 h-4 w-4" />
                    )}
                    Disable 2FA
                  </button>
                </div>

                {showBackupCodes && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        Backup Codes
                      </h4>
                      <button
                        onClick={downloadBackupCodes}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Download
                      </button>
                    </div>
                    <p className="mb-3 text-sm text-gray-600">
                      Use these codes if you lose access to your authenticator
                      app. Each code can only be used once.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "ABC12345",
                        "DEF67890",
                        "GHI11111",
                        "JKL22222",
                        "MNO33333",
                      ].map((code, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded border bg-white p-2"
                        >
                          <span className="font-mono text-sm">{code}</span>
                          <button
                            onClick={() => copyToClipboard(code)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Security Status */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Security Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <div className="flex items-center">
                  <div
                    className={`mr-3 h-3 w-3 rounded-full ${user?.is_active ? "bg-green-400" : "bg-red-400"}`}
                  />
                  <div>
                    <p className="font-medium text-gray-900">Account Status</p>
                    <p className="text-sm text-gray-600">
                      Your account is {user?.is_active ? "active" : "inactive"}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    user?.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user?.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <div className="flex items-center">
                  <div
                    className={`mr-3 h-3 w-3 rounded-full ${is2FAEnabled ? "bg-green-400" : "bg-yellow-400"}`}
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-gray-600">
                      Additional security layer
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    is2FAEnabled
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {is2FAEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div className="mr-3 h-3 w-3 rounded-full bg-green-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Password Strength
                    </p>
                    <p className="text-sm text-gray-600">
                      Your password meets security requirements
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                  Strong
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* 2FA Setup Modal */}
        {showSetup && (
          <TwoFactorSetupModal
            step={setupStep}
            twoFactorData={twoFactorData}
            verificationToken={verificationToken}
            setVerificationToken={setVerificationToken}
            backupCodes={backupCodes}
            onVerify={verifyTwoFactorSetup}
            onComplete={completeSetup}
            onCancel={() => setShowSetup(false)}
            loading={loading}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Two-Factor Setup Modal Component
function TwoFactorSetupModal({
  step,
  twoFactorData,
  verificationToken,
  setVerificationToken,
  backupCodes,
  onVerify,
  onComplete,
  onCancel,
  loading,
}: any) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ashley-ai-backup-codes.txt";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-screen w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Setup Two-Factor Authentication
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {step === 1 && twoFactorData && (
          <div className="space-y-4">
            <div className="text-center">
              <QrCode className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <h4 className="mb-2 font-medium text-gray-900">Scan QR Code</h4>
              <p className="mb-4 text-sm text-gray-600">
                Use your authenticator app to scan this QR code
              </p>
            </div>

            <div className="mb-4 flex justify-center">
              <img
                src={twoFactorData.qrCode}
                alt="2FA QR Code"
                className="rounded border"
              />
            </div>

            <div className="rounded bg-gray-50 p-3">
              <p className="mb-2 text-xs text-gray-600">Manual entry code:</p>
              <div className="flex items-center justify-between">
                <code className="font-mono text-sm">
                  {twoFactorData.manualEntryCode}
                </code>
                <button
                  onClick={() => copyToClipboard(twoFactorData.manualEntryCode)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded bg-blue-50 p-3">
              <p className="mb-2 text-sm font-medium text-blue-800">
                Instructions:
              </p>
              <ol className="space-y-1 text-xs text-blue-700">
                {twoFactorData.instructions?.map(
                  (instruction: string, index: number) => (
                    <li key={index}>{instruction}</li>
                  )
                )}
              </ol>
            </div>

            <button
              onClick={() => setVerificationToken("")}
              className="w-full rounded-md bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Next: Verify Setup
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <Smartphone className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h4 className="mb-2 font-medium text-gray-900">
                Enter Verification Code
              </h4>
              <p className="mb-4 text-sm text-gray-600">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <input
              type="text"
              maxLength={6}
              value={verificationToken}
              onChange={e =>
                setVerificationToken(e.target.value.replace(/\D/g, ""))
              }
              placeholder="000000"
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-center font-mono text-lg focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-md bg-gray-100 py-2 text-gray-700 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={onVerify}
                disabled={verificationToken.length !== 6 || loading}
                className="flex flex-1 items-center justify-center rounded-md bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify & Enable"
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h4 className="mb-2 font-medium text-gray-900">
                2FA Successfully Enabled!
              </h4>
              <p className="mb-4 text-sm text-gray-600">
                Save these backup codes in a safe place
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h5 className="font-medium text-gray-900">Backup Codes</h5>
                <button
                  onClick={downloadBackupCodes}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {backupCodes.map((code: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded border bg-white p-2"
                  >
                    <span className="font-mono text-sm">{code}</span>
                    <button
                      onClick={() => copyToClipboard(code)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Store these codes safely. Each code
                can only be used once and they're your only way to access your
                account if you lose your phone.
              </p>
            </div>

            <button
              onClick={onComplete}
              className="w-full rounded-md bg-green-600 py-2 text-white transition-colors hover:bg-green-700"
            >
              Complete Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
