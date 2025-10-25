"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AccountSettingsPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const alert_1 = require("@/components/ui/alert");
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
function AccountSettingsPage() {
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [uploadingAvatar, setUploadingAvatar] = (0, react_1.useState)(false);
    const [avatarPreview, setAvatarPreview] = (0, react_1.useState)(null);
    const fileInputRef = (0, react_1.useRef)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        name: "",
        email: "",
        current_email: "",
        phone: "",
        bio: "",
    });
    (0, react_1.useEffect)(() => {
        fetchUserData();
    }, []);
    const fetchUserData = async () => {
        try {
            const response = await fetch("/api/settings/account");
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    name: data.name || "",
                    email: data.email || "",
                    current_email: data.email || "",
                    phone: data.phone || "",
                    bio: data.bio || "",
                });
                if (data.avatar_url) {
                    setAvatarPreview(data.avatar_url);
                }
            }
        }
        catch (error) {
            console.error("Failed to fetch user data:", error);
        }
    };
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        // Validate file type
        if (!file.type.startsWith("image/")) {
            react_hot_toast_1.default.error("Please select an image file");
            return;
        }
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            react_hot_toast_1.default.error("Image size must be less than 5MB");
            return;
        }
        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
        // Upload
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append("avatar", file);
        try {
            const response = await fetch("/api/settings/avatar", {
                method: "POST",
                body: formData,
            });
            if (!response.ok) {
                throw new Error("Failed to upload avatar");
            }
            const data = await response.json();
            react_hot_toast_1.default.success("Avatar updated successfully!");
            setAvatarPreview(data.avatar_url);
        }
        catch (error) {
            react_hot_toast_1.default.error("Failed to upload avatar");
            setAvatarPreview(null);
        }
        finally {
            setUploadingAvatar(false);
        }
    };
    const handleRemoveAvatar = async () => {
        if (!confirm("Are you sure you want to remove your avatar?"))
            return;
        setUploadingAvatar(true);
        try {
            const response = await fetch("/api/settings/avatar", {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to remove avatar");
            }
            react_hot_toast_1.default.success("Avatar removed successfully!");
            setAvatarPreview(null);
        }
        catch (error) {
            react_hot_toast_1.default.error("Failed to remove avatar");
        }
        finally {
            setUploadingAvatar(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            react_hot_toast_1.default.error("Please enter a valid email address");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("/api/settings/account", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email !== formData.current_email
                        ? formData.email
                        : undefined,
                    phone: formData.phone,
                    bio: formData.bio,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to update account");
            }
            if (data.email_verification_required) {
                react_hot_toast_1.default.success("Account updated! Please check your new email to verify.");
            }
            else {
                react_hot_toast_1.default.success("Account updated successfully!");
            }
            setFormData({ ...formData, current_email: formData.email });
        }
        catch (error) {
            react_hot_toast_1.default.error(error.message || "Failed to update account");
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="max-w-2xl space-y-6 p-6">
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center gap-4">
        <button_1.Button variant="ghost" onClick={() => router.push("/settings")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white">
          <lucide_react_1.ArrowLeft className="h-5 w-5"/>
          <span>Back to Settings</span>
        </button_1.Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Account Settings
        </h2>
        <p className="mt-1 text-gray-500 dark:text-gray-500">
          Manage your account information and profile
        </p>
      </div>

      {/* Avatar Section */}
      <div className="space-y-4">
        <label_1.Label>Profile Picture</label_1.Label>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              {avatarPreview ? (<img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover"/>) : (<lucide_react_1.User className="h-12 w-12 text-gray-500 dark:text-gray-500"/>)}
            </div>
            {uploadingAvatar && (<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </div>)}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button_1.Button type="button" variant="outline" onClick={handleAvatarClick} disabled={uploadingAvatar}>
              <lucide_react_1.Upload className="mr-2 h-4 w-4"/>
              Upload Photo
            </button_1.Button>
            {avatarPreview && (<button_1.Button type="button" variant="outline" onClick={handleRemoveAvatar} disabled={uploadingAvatar} className="text-red-600 hover:text-red-700 dark:text-red-400">
                <lucide_react_1.Trash2 className="mr-2 h-4 w-4"/>
                Remove
              </button_1.Button>)}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden"/>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          JPG, PNG or GIF. Max size 5MB.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 border-t pt-6 dark:border-gray-700">
        {/* Name */}
        <div>
          <label_1.Label htmlFor="name">Full Name *</label_1.Label>
          <input_1.Input id="name" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter your full name" required className="dark:bg-gray-800 dark:text-white"/>
        </div>

        {/* Email */}
        <div>
          <label_1.Label htmlFor="email">Email Address *</label_1.Label>
          <input_1.Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="your.email@example.com" required className="dark:bg-gray-800 dark:text-white"/>
          {formData.email !== formData.current_email && (<alert_1.Alert className="mt-2">
              <lucide_react_1.Mail className="h-4 w-4"/>
              <alert_1.AlertDescription>
                Changing your email will require verification. You'll receive a
                verification link at your new email address.
              </alert_1.AlertDescription>
            </alert_1.Alert>)}
        </div>

        {/* Phone */}
        <div>
          <label_1.Label htmlFor="phone">Phone Number</label_1.Label>
          <input_1.Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+63 912 345 6789" className="dark:bg-gray-800 dark:text-white"/>
        </div>

        {/* Bio */}
        <div>
          <label_1.Label htmlFor="bio">Bio</label_1.Label>
          <textarea id="bio" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us a bit about yourself..." rows={4} maxLength={500} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"/>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            {formData.bio.length}/500 characters
          </p>
        </div>

        {/* Save Button */}
        <div className="border-t pt-4 dark:border-gray-700">
          <button_1.Button type="submit" disabled={loading} className="w-full md:w-auto">
            <lucide_react_1.Save className="mr-2 h-4 w-4"/>
            {loading ? "Saving..." : "Save Changes"}
          </button_1.Button>
        </div>
      </form>
    </div>);
}
