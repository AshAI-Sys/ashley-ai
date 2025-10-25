"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotificationPreferencesPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
function NotificationPreferencesPage() {
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [settings, setSettings] = (0, react_1.useState)({ orders: { email: true, sms: false, push: true, in_app: true }, production: { email: true, sms: false, push: true, in_app: true }, quality: { email: true, sms: true, push: true, in_app: true }, delivery: { email: true, sms: false, push: true, in_app: true }, finance: { email: true, sms: false, push: false, in_app: true }, hr: { email: false, sms: false, push: false, in_app: true }, maintenance: { email: true, sms: false, push: true, in_app: true }, system: { email: true, sms: false, push: true, in_app: true }, });
    (0, react_1.useEffect)(() => { fetchNotificationSettings(); }, []);
    const fetchNotificationSettings = async () => { try {
        const response = await fetch("/api/settings/notifications");
        if (response.ok) {
            const data = await response.json();
            if (data.settings) {
                setSettings(data.settings);
            }
        }
    }
    catch (error) {
        console.error("Failed to fetch notification settings:", error);
    } };
    const handleToggle = (category, channel) => { setSettings({ ...settings, [category]: { ...settings[category], [channel]: !settings[category][channel], }, }); };
    const handleSelectAll = (channel, value) => { const updatedSettings = { ...settings }; Object.keys(updatedSettings).forEach(key => { updatedSettings[key][channel] = value; }); setSettings(updatedSettings); };
    const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try {
        const response = await fetch("/api/settings/notifications", { method: "PUT", headers: { "Content-Type": "application/json", }, body: JSON.stringify({ settings }), });
        if (!response.ok) {
            throw new Error("Failed to update notification preferences");
        }
        react_hot_toast_1.default.success("Notification preferences updated successfully!");
    }
    catch (error) {
        react_hot_toast_1.default.error("Failed to update notification preferences");
    }
    finally {
        setLoading(false);
    } };
    const categories = [{ key: "orders", label: "Orders & Intake", description: "New orders, status changes, approvals", }, { key: "production", label: "Production", description: "Cutting, printing, sewing updates", }, { key: "quality", label: "Quality Control", description: "Inspections, defects, CAPA tasks", }, { key: "delivery", label: "Delivery", description: "Shipments, tracking, proof of delivery", }, { key: "finance", label: "Finance", description: "Invoices, payments, expenses", }, { key: "hr", label: "HR & Payroll", description: "Attendance, payroll, employee updates", }, { key: "maintenance", label: "Maintenance", description: "Work orders, asset alerts, schedules", }, { key: "system", label: "System", description: "Account, security, system updates", },];
    return (<div className="space-y-6 p-6"> {/* Back Button */} <button_1.Button variant="ghost" onClick={() => router.push("/settings")} className="mb-4"> <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/> Back to Settings </button_1.Button> <div> <h2 className="text-2xl font-bold text-gray-900"> Notification Preferences </h2> <p className="mt-1 text-gray-500"> Choose how you want to be notified about different events </p> </div> <form onSubmit={handleSubmit} className="space-y-6"> {/* Notification Channels Header */} <div className="overflow-x-auto"> <table className="w-full"> <thead> <tr className="border-b"> <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900"> Category </th> <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900"> <div className="flex flex-col items-center gap-1"> <lucide_react_1.Mail className="h-5 w-5"/> <span>Email</span> <button type="button" onClick={() => handleSelectAll("email", true)} className="text-xs text-blue-600 hover:underline"> All </button> </div> </th> <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900"> <div className="flex flex-col items-center gap-1"> <lucide_react_1.MessageSquare className="h-5 w-5"/> <span>SMS</span> <button type="button" onClick={() => handleSelectAll("sms", true)} className="text-xs text-blue-600 hover:underline"> All </button> </div> </th> <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900"> <div className="flex flex-col items-center gap-1"> <lucide_react_1.Smartphone className="h-5 w-5"/> <span>Push</span> <button type="button" onClick={() => handleSelectAll("push", true)} className="text-xs text-blue-600 hover:underline"> All </button> </div> </th> <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900"> <div className="flex flex-col items-center gap-1"> <lucide_react_1.Bell className="h-5 w-5"/> <span>In-App</span> <button type="button" onClick={() => handleSelectAll("in_app", true)} className="text-xs text-blue-600 hover:underline"> All </button> </div> </th> </tr> </thead> <tbody> {categories.map(category => (<tr key={category.key} className="border-b hover:bg-gray-50"> <td className="px-4 py-4"> <div> <div className="font-medium text-gray-900"> {category.label} </div> <div className="text-sm text-gray-500"> {category.description} </div> </div> </td> <td className="px-4 py-4 text-center"> <input type="checkbox" checked={settings[category.key].email} onChange={() => handleToggle(category.key, "email")} className="h-5 w-5 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"/> </td> <td className="px-4 py-4 text-center"> <input type="checkbox" checked={settings[category.key].sms} onChange={() => handleToggle(category.key, "sms")} className="h-5 w-5 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"/> </td> <td className="px-4 py-4 text-center"> <input type="checkbox" checked={settings[category.key].push} onChange={() => handleToggle(category.key, "push")} className="h-5 w-5 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"/> </td> <td className="px-4 py-4 text-center"> <input type="checkbox" checked={settings[category.key].in_app} onChange={() => handleToggle(category.key, "in_app")} className="h-5 w-5 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"/> </td> </tr>))} </tbody> </table> </div> {/* Quick Actions */} <div className="rounded-lg border border-blue-200 bg-blue-50 p-4"> <h4 className="mb-3 font-medium text-blue-900"> Quick Actions </h4> <div className="flex flex-wrap gap-2"> <button_1.Button type="button" variant="outline" size="sm" onClick={() => { const allOn = { ...settings }; Object.keys(allOn).forEach(key => { allOn[key] = { email: true, sms: true, push: true, in_app: true, }; }); setSettings(allOn); }}> Enable All </button_1.Button> <button_1.Button type="button" variant="outline" size="sm" onClick={() => { const allOff = { ...settings }; Object.keys(allOff).forEach(key => { allOff[key] = { email: false, sms: false, push: false, in_app: false, }; }); setSettings(allOff); }}> Disable All </button_1.Button> <button_1.Button type="button" variant="outline" size="sm" onClick={() => handleSelectAll("sms", false)}> Disable All SMS </button_1.Button> <button_1.Button type="button" variant="outline" size="sm" onClick={() => handleSelectAll("email", true)}> Enable All Email </button_1.Button> </div> </div> {/* Save Button */} <div className="border-t pt-6"> <button_1.Button type="submit" disabled={loading} className="w-full md:w-auto"> <lucide_react_1.Save className="mr-2 h-4 w-4"/> {loading ? "Saving..." : "Save Preferences"} </button_1.Button> </div> </form> </div>);
}
