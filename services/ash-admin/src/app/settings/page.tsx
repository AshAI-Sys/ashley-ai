"use client";

import { useState, useEffect } from "react";
import { Save, User, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    timezone: "Asia/Manila",
    language: "en",
    date_format: "MM/DD/YYYY",
    time_format: "12h",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/settings/general");
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || "",
          email: data.email || "",
          position: data.position || "",
          department: data.department || "",
          timezone: data.timezone || "Asia/Manila",
          language: data.language || "en",
          date_format: data.date_format || "MM/DD/YYYY",
          time_format: data.time_format || "12h",
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/settings/general", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      toast.success("General settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          General Settings
        </h2>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Update your profile information and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your full name"
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email cannot be changed here. Go to Account Settings.
              </p>
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                type="text"
                value={formData.position}
                onChange={e =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="e.g., Production Manager"
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                type="text"
                value={formData.department}
                onChange={e =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="e.g., Manufacturing"
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="space-y-4 border-t pt-6 dark:border-gray-700">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Globe className="h-5 w-5" />
            <span>Regional Settings</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={e =>
                  setFormData({ ...formData, timezone: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                <option value="Asia/Hong_Kong">Asia/Hong Kong (GMT+8)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                <option value="America/New_York">
                  America/New York (GMT-5)
                </option>
                <option value="America/Los_Angeles">
                  America/Los Angeles (GMT-8)
                </option>
                <option value="Europe/London">Europe/London (GMT+0)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={formData.language}
                onChange={e =>
                  setFormData({ ...formData, language: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="en">English</option>
                <option value="tl">Tagalog</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date & Time Format */}
        <div className="space-y-4 border-t pt-6 dark:border-gray-700">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Clock className="h-5 w-5" />
            <span>Date & Time Format</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="date_format">Date Format</Label>
              <select
                id="date_format"
                value={formData.date_format}
                onChange={e =>
                  setFormData({ ...formData, date_format: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="time_format">Time Format</Label>
              <select
                id="time_format"
                value={formData.time_format}
                onChange={e =>
                  setFormData({ ...formData, time_format: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="12h">12-hour (2:30 PM)</option>
                <option value="24h">24-hour (14:30)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="border-t pt-6 dark:border-gray-700">
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
