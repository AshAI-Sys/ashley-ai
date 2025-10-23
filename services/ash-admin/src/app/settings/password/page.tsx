"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import toast from "react-hot-toast";

export default function PasswordSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validatePassword = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleNewPasswordChange = (password: string) => {
    setFormData({ ...formData, newPassword: password });
    validatePassword(password);
  };

  const isPasswordValid = () => {
    return Object.values(passwordStrength).every(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!isPasswordValid()) {
      toast.error("New password does not meet requirements");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error("New password must be different from current password");
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

      toast.success("Password changed successfully!");

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
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/settings")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Settings
      </Button>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Change Password
        </h2>
        <p className="mt-1 text-gray-500 dark:text-gray-500">
          Update your password to keep your account secure
        </p>
      </div>

      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          For your security, we recommend using a strong password that you don't
          use elsewhere.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={formData.currentPassword}
              onChange={e =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              placeholder="Enter your current password"
              className="pr-10 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={e => handleNewPasswordChange(e.target.value)}
              placeholder="Enter your new password"
              className="pr-10 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Password Strength Indicators */}
          {formData.newPassword && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-600">
                Password must contain:
              </p>
              <div className="space-y-1">
                <PasswordRequirement
                  met={passwordStrength.hasMinLength}
                  text="At least 8 characters"
                />
                <PasswordRequirement
                  met={passwordStrength.hasUppercase}
                  text="One uppercase letter (A-Z)"
                />
                <PasswordRequirement
                  met={passwordStrength.hasLowercase}
                  text="One lowercase letter (a-z)"
                />
                <PasswordRequirement
                  met={passwordStrength.hasNumber}
                  text="One number (0-9)"
                />
                <PasswordRequirement
                  met={passwordStrength.hasSpecialChar}
                  text="One special character (!@#$%^&*)"
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={e =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Confirm your new password"
              className="pr-10 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {formData.confirmPassword &&
            formData.newPassword !== formData.confirmPassword && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <XCircle className="h-3 w-3" />
                Passwords do not match
              </p>
            )}
          {formData.confirmPassword &&
            formData.newPassword === formData.confirmPassword && (
              <p className="mt-1 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                Passwords match
              </p>
            )}
        </div>

        {/* Submit Button */}
        <div className="border-t pt-4 dark:border-gray-700">
          <Button
            type="submit"
            disabled={
              loading ||
              !isPasswordValid() ||
              formData.newPassword !== formData.confirmPassword
            }
            className="w-full md:w-auto"
          >
            <Lock className="mr-2 h-4 w-4" />
            {loading ? "Changing Password..." : "Change Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-500 dark:text-gray-500" />
      )}
      <span
        className={
          met
            ? "text-green-600 dark:text-green-400"
            : "text-gray-600 dark:text-gray-500"
        }
      >
        {text}
      </span>
    </div>
  );
}
