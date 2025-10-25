"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PasswordSettingsPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const alert_1 = require("@/components/ui/alert");
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
function PasswordSettingsPage() {
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [showCurrentPassword, setShowCurrentPassword] = (0, react_1.useState)(false);
    const [showNewPassword, setShowNewPassword] = (0, react_1.useState)(false);
    const [showConfirmPassword, setShowConfirmPassword] = (0, react_1.useState)(false);
    const [formData, setFormData] = (0, react_1.useState)({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordStrength, setPasswordStrength] = (0, react_1.useState)({
        hasMinLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });
    const validatePassword = (password) => {
        setPasswordStrength({
            hasMinLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    };
    const handleNewPasswordChange = (password) => {
        setFormData({ ...formData, newPassword: password });
        validatePassword(password);
    };
    const isPasswordValid = () => {
        return Object.values(passwordStrength).every(Boolean);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation
        if (!formData.currentPassword) {
            react_hot_toast_1.default.error("Please enter your current password");
            return;
        }
        if (!isPasswordValid()) {
            react_hot_toast_1.default.error("New password does not meet requirements");
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            react_hot_toast_1.default.error("New passwords do not match");
            return;
        }
        if (formData.currentPassword === formData.newPassword) {
            react_hot_toast_1.default.error("New password must be different from current password");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("/api/settings/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    current_password: formData.currentPassword,
                    new_password: formData.newPassword,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to change password");
            }
            react_hot_toast_1.default.success("Password changed successfully!");
            // Reset form
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setPasswordStrength({
                hasMinLength: false,
                hasUppercase: false,
                hasLowercase: false,
                hasNumber: false,
                hasSpecialChar: false,
            });
        }
        catch (error) {
            react_hot_toast_1.default.error(error.message || "Failed to change password");
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="max-w-2xl space-y-6 p-6">
      {/* Back Button */}
      <button_1.Button variant="ghost" onClick={() => router.push("/settings")} className="mb-4">
        <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/>
        Back to Settings
      </button_1.Button>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Change Password
        </h2>
        <p className="mt-1 text-gray-500 dark:text-gray-500">
          Update your password to keep your account secure
        </p>
      </div>

      <alert_1.Alert>
        <lucide_react_1.Lock className="h-4 w-4"/>
        <alert_1.AlertDescription>
          For your security, we recommend using a strong password that you don't
          use elsewhere.
        </alert_1.AlertDescription>
      </alert_1.Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label_1.Label htmlFor="currentPassword">Current Password</label_1.Label>
          <div className="relative">
            <input_1.Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} value={formData.currentPassword} onChange={e => setFormData({ ...formData, currentPassword: e.target.value })} placeholder="Enter your current password" className="pr-10 dark:bg-gray-800 dark:text-white"/>
            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200">
              {showCurrentPassword ? (<lucide_react_1.EyeOff className="h-4 w-4"/>) : (<lucide_react_1.Eye className="h-4 w-4"/>)}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label_1.Label htmlFor="newPassword">New Password</label_1.Label>
          <div className="relative">
            <input_1.Input id="newPassword" type={showNewPassword ? "text" : "password"} value={formData.newPassword} onChange={e => handleNewPasswordChange(e.target.value)} placeholder="Enter your new password" className="pr-10 dark:bg-gray-800 dark:text-white"/>
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200">
              {showNewPassword ? (<lucide_react_1.EyeOff className="h-4 w-4"/>) : (<lucide_react_1.Eye className="h-4 w-4"/>)}
            </button>
          </div>

          {/* Password Strength Indicators */}
          {formData.newPassword && (<div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-600">
                Password must contain:
              </p>
              <div className="space-y-1">
                <PasswordRequirement met={passwordStrength.hasMinLength} text="At least 8 characters"/>
                <PasswordRequirement met={passwordStrength.hasUppercase} text="One uppercase letter (A-Z)"/>
                <PasswordRequirement met={passwordStrength.hasLowercase} text="One lowercase letter (a-z)"/>
                <PasswordRequirement met={passwordStrength.hasNumber} text="One number (0-9)"/>
                <PasswordRequirement met={passwordStrength.hasSpecialChar} text="One special character (!@#$%^&*)"/>
              </div>
            </div>)}
        </div>

        {/* Confirm Password */}
        <div>
          <label_1.Label htmlFor="confirmPassword">Confirm New Password</label_1.Label>
          <div className="relative">
            <input_1.Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Confirm your new password" className="pr-10 dark:bg-gray-800 dark:text-white"/>
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200">
              {showConfirmPassword ? (<lucide_react_1.EyeOff className="h-4 w-4"/>) : (<lucide_react_1.Eye className="h-4 w-4"/>)}
            </button>
          </div>
          {formData.confirmPassword &&
            formData.newPassword !== formData.confirmPassword && (<p className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <lucide_react_1.XCircle className="h-3 w-3"/>
                Passwords do not match
              </p>)}
          {formData.confirmPassword &&
            formData.newPassword === formData.confirmPassword && (<p className="mt-1 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <lucide_react_1.CheckCircle2 className="h-3 w-3"/>
                Passwords match
              </p>)}
        </div>

        {/* Submit Button */}
        <div className="border-t pt-4 dark:border-gray-700">
          <button_1.Button type="submit" disabled={loading ||
            !isPasswordValid() ||
            formData.newPassword !== formData.confirmPassword} className="w-full md:w-auto">
            <lucide_react_1.Lock className="mr-2 h-4 w-4"/>
            {loading ? "Changing Password..." : "Change Password"}
          </button_1.Button>
        </div>
      </form>
    </div>);
}
function PasswordRequirement({ met, text }) {
    return (<div className="flex items-center gap-2 text-sm">
      {met ? (<lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400"/>) : (<lucide_react_1.XCircle className="h-4 w-4 text-gray-500 dark:text-gray-500"/>)}
      <span className={met
            ? "text-green-600 dark:text-green-400"
            : "text-gray-600 dark:text-gray-500"}>
        {text}
      </span>
    </div>);
}
