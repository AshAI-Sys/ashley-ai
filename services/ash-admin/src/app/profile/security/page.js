'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SecuritySettingsPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const auth_context_1 = require("@/lib/auth-context");
const lucide_react_1 = require("lucide-react");
function SecuritySettingsPage() {
    const [is2FAEnabled, setIs2FAEnabled] = (0, react_1.useState)(false);
    const [showSetup, setShowSetup] = (0, react_1.useState)(false);
    const [twoFactorData, setTwoFactorData] = (0, react_1.useState)(null);
    const [verificationToken, setVerificationToken] = (0, react_1.useState)('');
    const [showBackupCodes, setShowBackupCodes] = (0, react_1.useState)(false);
    const [backupCodes, setBackupCodes] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [setupStep, setSetupStep] = (0, react_1.useState)(1); // 1: QR Code, 2: Verification, 3: Backup Codes
    const { user } = (0, auth_context_1.useAuth)();
    const router = (0, navigation_1.useRouter)();
    (0, react_1.useEffect)(() => {
        checkTwoFactorStatus();
    }, []);
    const checkTwoFactorStatus = async () => {
        try {
            // In real implementation, check user's 2FA status from API
            // For demo, check from user object
            setIs2FAEnabled(user?.requires_2fa || false);
        }
        catch (error) {
            console.error('Error checking 2FA status:', error);
        }
    };
    const initiateTwoFactorSetup = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('ash_token');
            const response = await fetch('/api/auth/2fa/setup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'generate' })
            });
            if (response.ok) {
                const data = await response.json();
                setTwoFactorData(data.data);
                setShowSetup(true);
                setSetupStep(1);
            }
            else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        }
        catch (error) {
            console.error('Error initiating 2FA setup:', error);
            alert('Failed to initiate 2FA setup');
        }
        finally {
            setLoading(false);
        }
    };
    const verifyTwoFactorSetup = async () => {
        if (!verificationToken || verificationToken.length !== 6) {
            alert('Please enter a valid 6-digit code');
            return;
        }
        try {
            setLoading(true);
            const token = localStorage.getItem('ash_token');
            const response = await fetch('/api/auth/2fa/setup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'verify',
                    token: verificationToken
                })
            });
            if (response.ok) {
                const data = await response.json();
                setBackupCodes(data.data.backupCodes);
                setIs2FAEnabled(true);
                setSetupStep(3);
            }
            else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        }
        catch (error) {
            console.error('Error verifying 2FA setup:', error);
            alert('Failed to verify 2FA setup');
        }
        finally {
            setLoading(false);
        }
    };
    const disableTwoFactor = async () => {
        if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
            return;
        }
        try {
            setLoading(true);
            const token = localStorage.getItem('ash_token');
            const response = await fetch('/api/auth/2fa/setup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'disable' })
            });
            if (response.ok) {
                setIs2FAEnabled(false);
                setShowSetup(false);
                setTwoFactorData(null);
                setBackupCodes([]);
                alert('Two-factor authentication has been disabled');
            }
            else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        }
        catch (error) {
            console.error('Error disabling 2FA:', error);
            alert('Failed to disable 2FA');
        }
        finally {
            setLoading(false);
        }
    };
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
        }
        catch (error) {
            console.error('Failed to copy:', error);
        }
    };
    const downloadBackupCodes = () => {
        const content = backupCodes.join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ashley-ai-backup-codes.txt';
        a.click();
        window.URL.revokeObjectURL(url);
    };
    const completeSetup = () => {
        setShowSetup(false);
        setSetupStep(1);
        setVerificationToken('');
        setTwoFactorData(null);
    };
    return (<dashboard_layout_1.default>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <lucide_react_1.Shield className="w-8 h-8 mr-3 text-blue-600"/>
                Security Settings
              </h1>
              <p className="text-sm text-gray-600">Manage your account security and two-factor authentication</p>
            </div>
            <button onClick={() => router.push('/dashboard')} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
              Back to Dashboard
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Two-Factor Authentication Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <lucide_react_1.Smartphone className="w-5 h-5 mr-2 text-green-600"/>
                  Two-Factor Authentication
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center">
                {is2FAEnabled ? (<div className="flex items-center text-green-600">
                    <lucide_react_1.CheckCircle className="w-5 h-5 mr-2"/>
                    <span className="text-sm font-medium">Enabled</span>
                  </div>) : (<div className="flex items-center text-red-600">
                    <lucide_react_1.AlertTriangle className="w-5 h-5 mr-2"/>
                    <span className="text-sm font-medium">Disabled</span>
                  </div>)}
              </div>
            </div>

            {!is2FAEnabled ? (<div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Why enable 2FA?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Protects your account even if your password is compromised</li>
                    <li>• Required for admin users and sensitive operations</li>
                    <li>• Uses your phone's authenticator app for verification</li>
                    <li>• Includes backup codes for account recovery</li>
                  </ul>
                </div>

                <button onClick={initiateTwoFactorSetup} disabled={loading} className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center">
                  {loading ? (<lucide_react_1.RefreshCw className="w-4 h-4 mr-2 animate-spin"/>) : (<lucide_react_1.Lock className="w-4 h-4 mr-2"/>)}
                  Enable Two-Factor Authentication
                </button>
              </div>) : (<div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    Two-factor authentication is enabled for your account. Your account is protected by an additional verification step.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button onClick={() => setShowBackupCodes(!showBackupCodes)} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
                    <lucide_react_1.Key className="w-4 h-4 mr-2"/>
                    {showBackupCodes ? 'Hide' : 'Show'} Backup Codes
                  </button>

                  <button onClick={disableTwoFactor} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center">
                    {loading ? (<lucide_react_1.RefreshCw className="w-4 h-4 mr-2 animate-spin"/>) : (<lucide_react_1.Unlock className="w-4 h-4 mr-2"/>)}
                    Disable 2FA
                  </button>
                </div>

                {showBackupCodes && (<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Backup Codes</h4>
                      <button onClick={downloadBackupCodes} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                        <lucide_react_1.Download className="w-4 h-4 mr-1"/>
                        Download
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Use these codes if you lose access to your authenticator app. Each code can only be used once.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {['ABC12345', 'DEF67890', 'GHI11111', 'JKL22222', 'MNO33333'].map((code, index) => (<div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <span className="font-mono text-sm">{code}</span>
                          <button onClick={() => copyToClipboard(code)} className="text-gray-400 hover:text-gray-600">
                            <lucide_react_1.Copy className="w-4 h-4"/>
                          </button>
                        </div>))}
                    </div>
                  </div>)}
              </div>)}
          </div>

          {/* Account Security Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${user?.is_active ? 'bg-green-400' : 'bg-red-400'}`}/>
                  <div>
                    <p className="font-medium text-gray-900">Account Status</p>
                    <p className="text-sm text-gray-600">Your account is {user?.is_active ? 'active' : 'inactive'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${is2FAEnabled ? 'bg-green-400' : 'bg-yellow-400'}`}/>
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Additional security layer</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${is2FAEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {is2FAEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 bg-green-400"/>
                  <div>
                    <p className="font-medium text-gray-900">Password Strength</p>
                    <p className="text-sm text-gray-600">Your password meets security requirements</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Strong
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* 2FA Setup Modal */}
        {showSetup && (<TwoFactorSetupModal step={setupStep} twoFactorData={twoFactorData} verificationToken={verificationToken} setVerificationToken={setVerificationToken} backupCodes={backupCodes} onVerify={verifyTwoFactorSetup} onComplete={completeSetup} onCancel={() => setShowSetup(false)} loading={loading}/>)}
      </div>
    </dashboard_layout_1.default>);
}
// Two-Factor Setup Modal Component
function TwoFactorSetupModal({ step, twoFactorData, verificationToken, setVerificationToken, backupCodes, onVerify, onComplete, onCancel, loading }) {
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
        }
        catch (error) {
            console.error('Failed to copy:', error);
        }
    };
    const downloadBackupCodes = () => {
        const content = backupCodes.join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ashley-ai-backup-codes.txt';
        a.click();
        window.URL.revokeObjectURL(url);
    };
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Setup Two-Factor Authentication</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {step === 1 && twoFactorData && (<div className="space-y-4">
            <div className="text-center">
              <lucide_react_1.QrCode className="w-12 h-12 text-blue-600 mx-auto mb-4"/>
              <h4 className="font-medium text-gray-900 mb-2">Scan QR Code</h4>
              <p className="text-sm text-gray-600 mb-4">
                Use your authenticator app to scan this QR code
              </p>
            </div>

            <div className="flex justify-center mb-4">
              <img src={twoFactorData.qrCode} alt="2FA QR Code" className="border rounded"/>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600 mb-2">Manual entry code:</p>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono">{twoFactorData.manualEntryCode}</code>
                <button onClick={() => copyToClipboard(twoFactorData.manualEntryCode)} className="text-blue-600 hover:text-blue-800">
                  <lucide_react_1.Copy className="w-4 h-4"/>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-blue-800 font-medium mb-2">Instructions:</p>
              <ol className="text-xs text-blue-700 space-y-1">
                {twoFactorData.instructions?.map((instruction, index) => (<li key={index}>{instruction}</li>))}
              </ol>
            </div>

            <button onClick={() => setVerificationToken('')} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
              Next: Verify Setup
            </button>
          </div>)}

        {step === 2 && (<div className="space-y-4">
            <div className="text-center">
              <lucide_react_1.Smartphone className="w-12 h-12 text-green-600 mx-auto mb-4"/>
              <h4 className="font-medium text-gray-900 mb-2">Enter Verification Code</h4>
              <p className="text-sm text-gray-600 mb-4">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <input type="text" maxLength={6} value={verificationToken} onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="w-full px-4 py-3 border border-gray-300 rounded-md text-center text-lg font-mono focus:ring-2 focus:ring-blue-500"/>

            <div className="flex space-x-3">
              <button onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={onVerify} disabled={verificationToken.length !== 6 || loading} className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center">
                {loading ? (<lucide_react_1.RefreshCw className="w-4 h-4 animate-spin"/>) : ('Verify & Enable')}
              </button>
            </div>
          </div>)}

        {step === 3 && (<div className="space-y-4">
            <div className="text-center">
              <lucide_react_1.CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4"/>
              <h4 className="font-medium text-gray-900 mb-2">2FA Successfully Enabled!</h4>
              <p className="text-sm text-gray-600 mb-4">
                Save these backup codes in a safe place
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">Backup Codes</h5>
                <button onClick={downloadBackupCodes} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                  <lucide_react_1.Download className="w-4 h-4 mr-1"/>
                  Download
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {backupCodes.map((code, index) => (<div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="font-mono text-sm">{code}</span>
                    <button onClick={() => copyToClipboard(code)} className="text-gray-400 hover:text-gray-600">
                      <lucide_react_1.Copy className="w-4 h-4"/>
                    </button>
                  </div>))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Store these codes safely. Each code can only be used once and they're your only way to access your account if you lose your phone.
              </p>
            </div>

            <button onClick={onComplete} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors">
              Complete Setup
            </button>
          </div>)}
      </div>
    </div>);
}
