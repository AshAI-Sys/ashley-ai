"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SecuritySettingsPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const alert_1 = require("@/components/ui/alert");
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
function SecuritySettingsPage() {
    const router = (0, navigation_1.useRouter)();
    const [show2FASetup, setShow2FASetup] = (0, react_1.useState)(false);
    const [qrCode, setQrCode] = (0, react_1.useState)("");
    const [backupCodes, setBackupCodes] = (0, react_1.useState)([]);
    const [verificationCode, setVerificationCode] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = (0, react_1.useState)(false);
    const userId = "cmg8yu1ke0001c81pbqgcamxu"; // TODO: Get from auth context
    const setup2FA = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/auth/2fa/setup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: userId }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to setup 2FA");
            }
            setQrCode(data.qr_code);
            setBackupCodes(data.backup_codes);
            setShow2FASetup(true);
            react_hot_toast_1.default.success("2FA setup initiated. Scan the QR code with your authenticator app.");
        }
        catch (error) {
            react_hot_toast_1.default.error(error.message || "Failed to setup 2FA");
        }
        finally {
            setLoading(false);
        }
    };
    const verify2FA = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            react_hot_toast_1.default.error("Please enter a 6-digit code");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("/api/auth/2fa/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
                    token: verificationCode,
                    enable_2fa: true,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Invalid verification code");
            }
            setTwoFactorEnabled(true);
            setShow2FASetup(false);
            setVerificationCode("");
            react_hot_toast_1.default.success("2FA enabled successfully!");
        }
        catch (error) {
            react_hot_toast_1.default.error(error.message || "Invalid verification code");
        }
        finally {
            setLoading(false);
        }
    };
    const disable2FA = async () => {
        if (!confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) {
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`/api/auth/2fa/setup?user_id=${userId}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to disable 2FA");
            }
            setTwoFactorEnabled(false);
            react_hot_toast_1.default.success("2FA has been disabled");
        }
        catch (error) {
            react_hot_toast_1.default.error(error.message || "Failed to disable 2FA");
        }
        finally {
            setLoading(false);
        }
    };
    const downloadBackupCodes = () => {
        const text = backupCodes.join("\n");
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ashley-ai-backup-codes.txt";
        a.click();
        URL.revokeObjectURL(url);
        react_hot_toast_1.default.success("Backup codes downloaded");
    };
    return (<div className="mx-auto max-w-4xl space-y-6 p-8">
      {/* Back Button */}
      <button_1.Button variant="ghost" onClick={() => router.push("/settings")} className="mb-4">
        <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/>
        Back to Settings
      </button_1.Button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="mt-2 text-gray-500">
          Manage your account security and authentication
        </p>
      </div>

      {/* 2FA Status Card */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Shield className="h-5 w-5"/>
            Two-Factor Authentication (2FA)
          </card_1.CardTitle>
          <card_1.CardDescription>
            Add an extra layer of security to your account
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <alert_1.Alert>
            <lucide_react_1.AlertCircle className="h-4 w-4"/>
            <alert_1.AlertDescription>
              {twoFactorEnabled
            ? "2FA is currently enabled for your account. You will need to enter a code from your authenticator app when logging in."
            : "Enable 2FA to protect your account with time-based one-time passwords (TOTP) using apps like Google Authenticator or Authy."}
            </alert_1.AlertDescription>
          </alert_1.Alert>

          {twoFactorEnabled ? (<div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <lucide_react_1.CheckCircle2 className="h-5 w-5 text-green-600"/>
                <div>
                  <p className="font-medium text-green-900">2FA is Enabled</p>
                  <p className="text-sm text-green-700">
                    Your account is protected
                  </p>
                </div>
              </div>
              <button_1.Button variant="outline" onClick={disable2FA} disabled={loading}>
                Disable 2FA
              </button_1.Button>
            </div>) : (<button_1.Button onClick={setup2FA} disabled={loading}>
              <lucide_react_1.Key className="mr-2 h-4 w-4"/>
              {loading ? "Setting up..." : "Enable 2FA"}
            </button_1.Button>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* 2FA Setup Modal */}
      {show2FASetup && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <card_1.Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Smartphone className="h-5 w-5"/>
                  Setup Two-Factor Authentication
                </card_1.CardTitle>
                <button_1.Button variant="ghost" size="sm" onClick={() => setShow2FASetup(false)}>
                  <lucide_react_1.X className="h-4 w-4"/>
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              {/* Step 1: Scan QR Code */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Step 1: Scan QR Code
                  </h3>
                  <p className="text-sm text-gray-600">
                    Scan this QR code with your authenticator app (Google
                    Authenticator, Authy, etc.)
                  </p>
                </div>
                {qrCode && (<div className="flex justify-center rounded-lg border bg-white p-4">
                    <img src={qrCode} alt="2FA QR Code" className="h-64 w-64"/>
                  </div>)}
              </div>

              {/* Step 2: Save Backup Codes */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Step 2: Save Backup Codes
                  </h3>
                  <p className="text-sm text-gray-600">
                    Save these backup codes in a safe place. You can use them to
                    access your account if you lose your phone.
                  </p>
                </div>
                <div className="space-y-2 rounded-lg border bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (<div key={index} className="rounded border bg-white p-2 text-center">
                        {code}
                      </div>))}
                  </div>
                  <button_1.Button onClick={downloadBackupCodes} variant="outline" size="sm" className="mt-2 w-full">
                    <lucide_react_1.Download className="mr-2 h-4 w-4"/>
                    Download Backup Codes
                  </button_1.Button>
                </div>
                <alert_1.Alert>
                  <lucide_react_1.AlertCircle className="h-4 w-4"/>
                  <alert_1.AlertDescription>
                    These codes will only be shown once. Make sure to save them
                    before continuing.
                  </alert_1.AlertDescription>
                </alert_1.Alert>
              </div>

              {/* Step 3: Verify */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Step 3: Verify Setup
                  </h3>
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit code from your authenticator app to verify
                    setup
                  </p>
                </div>
                <div>
                  <label_1.Label htmlFor="code">Verification Code</label_1.Label>
                  <input_1.Input id="code" type="text" maxLength={6} placeholder="000000" value={verificationCode} onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ""))} className="text-center text-2xl tracking-widest"/>
                </div>
                <button_1.Button onClick={verify2FA} disabled={loading || verificationCode.length !== 6} className="w-full">
                  {loading ? "Verifying..." : "Verify and Enable 2FA"}
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>)}
    </div>);
}
