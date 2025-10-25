"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppearanceSettingsPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const label_1 = require("@/components/ui/label");
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
function AppearanceSettingsPage() {
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [theme] = (0, react_1.useState)("light");
    const [colorScheme, setColorScheme] = (0, react_1.useState)("blue");
    const [compactMode, setCompactMode] = (0, react_1.useState)(false);
    const [showAvatars, setShowAvatars] = (0, react_1.useState)(true);
    const [fontSize, setFontSize] = (0, react_1.useState)("medium");
    (0, react_1.useEffect)(() => {
        // FORCE LIGHT MODE
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
        fetchAppearanceSettings();
    }, []);
    const fetchAppearanceSettings = async () => {
        try {
            const response = await fetch("/api/settings/appearance");
            if (response.ok) {
                const data = await response.json();
                setColorScheme(data.color_scheme || "blue");
                setCompactMode(data.compact_mode || false);
                setShowAvatars(data.show_avatars !== false);
                setFontSize(data.font_size || "medium");
            }
        }
        catch (error) {
            console.error("Failed to fetch appearance settings:", error);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("/api/settings/appearance", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    theme: "light",
                    color_scheme: colorScheme,
                    compact_mode: compactMode,
                    show_avatars: showAvatars,
                    font_size: fontSize,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to update appearance settings");
            }
            react_hot_toast_1.default.success("Appearance settings updated successfully!");
        }
        catch (error) {
            react_hot_toast_1.default.error("Failed to update appearance settings");
        }
        finally {
            setLoading(false);
        }
    };
    const colorSchemes = [
        { value: "blue", label: "Blue", color: "bg-blue-600" },
        { value: "green", label: "Green", color: "bg-green-600" },
        { value: "purple", label: "Purple", color: "bg-purple-600" },
        { value: "orange", label: "Orange", color: "bg-orange-600" },
        { value: "red", label: "Red", color: "bg-red-600" },
    ];
    return (<div className="space-y-6 p-6">
      {/* Back Button */}
      <button_1.Button variant="ghost" onClick={() => router.push("/settings")} className="mb-4">
        <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/>
        Back to Settings
      </button_1.Button>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Appearance Settings
        </h2>
        <p className="mt-1 text-gray-500">
          Customize how Ashley AI looks and feels
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Theme Mode - Light Only */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <lucide_react_1.Palette className="h-5 w-5"/>
            <span>Theme Mode</span>
          </div>

          <div className="rounded-lg border-2 border-blue-600 bg-blue-50 p-6">
            <div className="mb-3 flex items-center justify-center">
              <lucide_react_1.Sun className="h-12 w-12 text-yellow-500"/>
            </div>
            <div className="text-center">
              <div className="mb-1 text-lg font-semibold text-gray-900">
                Light Mode
              </div>
              <div className="text-sm text-gray-600">
                Ashley AI uses a professional light theme for optimal
                readability
              </div>
            </div>
          </div>
        </div>

        {/* Color Scheme */}
        <div className="space-y-4 border-t pt-6 dark:border-gray-700">
          <label_1.Label>Accent Color</label_1.Label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {colorSchemes.map(scheme => (<button key={scheme.value} type="button" onClick={() => setColorScheme(scheme.value)} className={`relative rounded-lg border-2 p-4 transition-all ${colorScheme === scheme.value
                ? "border-gray-900 dark:border-white"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-600"} `}>
                <div className={`h-12 w-12 ${scheme.color} mx-auto mb-2 rounded-full`}></div>
                <div className="text-center text-sm font-medium text-gray-900 dark:text-white">
                  {scheme.label}
                </div>
                {colorScheme === scheme.value && (<div className="absolute right-2 top-2">
                    <lucide_react_1.Check className="h-4 w-4 text-gray-900 dark:text-white"/>
                  </div>)}
              </button>))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Choose your preferred accent color for buttons and highlights
          </p>
        </div>

        {/* Display Options */}
        <div className="space-y-4 border-t pt-6 dark:border-gray-700">
          <label_1.Label>Display Options</label_1.Label>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Compact Mode
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  Reduce spacing and padding for a denser layout
                </div>
              </div>
              <input type="checkbox" checked={compactMode} onChange={e => setCompactMode(e.target.checked)} className="h-5 w-5 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"/>
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Show Avatars
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  Display user avatars throughout the interface
                </div>
              </div>
              <input type="checkbox" checked={showAvatars} onChange={e => setShowAvatars(e.target.checked)} className="h-5 w-5 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"/>
            </label>
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-4 border-t pt-6 dark:border-gray-700">
          <label_1.Label htmlFor="fontSize">Font Size</label_1.Label>
          <select id="fontSize" value={fontSize} onChange={e => setFontSize(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
            <option value="small">Small</option>
            <option value="medium">Medium (Default)</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra Large</option>
          </select>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Adjust the base font size for better readability
          </p>
        </div>

        {/* Preview */}
        <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100">
            Preview
          </h4>
          <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-center gap-3">
              {showAvatars && (<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                  A
                </div>)}
              <div>
                <div className={`font-medium text-gray-900 dark:text-white ${fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-lg" : fontSize === "extra-large" ? "text-xl" : "text-base"}`}>
                  Ashley AI Manufacturing
                </div>
                <div className={`text-gray-500 dark:text-gray-500 ${fontSize === "small" ? "text-xs" : fontSize === "large" ? "text-base" : fontSize === "extra-large" ? "text-lg" : "text-sm"}`}>
                  admin@ashleyai.com
                </div>
              </div>
            </div>
            <button_1.Button type="button" className={`w-full ${compactMode ? "py-1 text-sm" : ""}`}>
              Sample Button
            </button_1.Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="border-t pt-6 dark:border-gray-700">
          <button_1.Button type="submit" disabled={loading} className="w-full md:w-auto">
            <lucide_react_1.Save className="mr-2 h-4 w-4"/>
            {loading ? "Saving..." : "Save Appearance"}
          </button_1.Button>
        </div>
      </form>
    </div>);
}
