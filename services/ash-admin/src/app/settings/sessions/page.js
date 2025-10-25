"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SessionManagementPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const alert_1 = require("@/components/ui/alert");
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
function SessionManagementPage() {
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [sessions, setSessions] = (0, react_1.useState)([]);
    const [revoking, setRevoking] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => { fetchSessions(); }, []);
    const fetchSessions = async () => { setLoading(true); try {
        const response = await fetch("/api/settings/sessions");
        if (response.ok) {
            const data = await response.json();
            setSessions(data.sessions || []);
        }
    }
    catch (error) {
        console.error("Failed to fetch sessions:", error);
        react_hot_toast_1.default.error("Failed to load sessions");
    }
    finally {
        setLoading(false);
    } };
    const revokeSession = async (sessionId) => { if (!confirm("Are you sure you want to sign out this device?"))
        return; setRevoking(sessionId); try {
        const response = await fetch(`/api/settings/sessions/${sessionId}`, { method: "DELETE", });
        if (!response.ok) {
            throw new Error("Failed to revoke session");
        }
        react_hot_toast_1.default.success("Session revoked successfully");
        setSessions(sessions.filter(s => s.id !== sessionId));
    }
    catch (error) {
        react_hot_toast_1.default.error("Failed to revoke session");
    }
    finally {
        setRevoking(null);
    } };
    const revokeAllSessions = async () => { if (!confirm("This will sign you out of all devices except this one. Continue?"))
        return; setLoading(true); try {
        const response = await fetch("/api/settings/sessions/revoke-all", { method: "POST", });
        if (!response.ok) {
            throw new Error("Failed to revoke sessions");
        }
        react_hot_toast_1.default.success("All other sessions have been revoked");
        await fetchSessions();
    }
    catch (error) {
        react_hot_toast_1.default.error("Failed to revoke sessions");
    }
    finally {
        setLoading(false);
    } };
    const getDeviceIcon = (deviceType) => { switch (deviceType.toLowerCase()) {
        case "mobile": return (<lucide_react_1.Smartphone className="h-6 w-6 text-blue-600"/>);
        case "tablet": return <lucide_react_1.Tablet className="h-6 w-6 text-blue-600"/>;
        default: return <lucide_react_1.Monitor className="h-6 w-6 text-blue-600"/>;
    } };
    const formatDate = (dateString) => { const date = new Date(dateString); const now = new Date(); const diff = now.getTime() - date.getTime(); const minutes = Math.floor(diff / 60000); const hours = Math.floor(diff / 3600000); const days = Math.floor(diff / 86400000); if (minutes < 1)
        return "Just now"; if (minutes < 60)
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`; if (hours < 24)
        return `${hours} hour${hours > 1 ? "s" : ""} ago`; if (days < 7)
        return `${days} day${days > 1 ? "s" : ""} ago`; return date.toLocaleDateString(); };
    if (loading) {
        return (<div className="space-y-6 p-6"> <div className="py-12 text-center"> <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div> <p className="mt-4 text-gray-500"> Loading sessions... </p> </div> </div>);
    }
    return (<div className="space-y-6 p-6"> {/* Back Button */} <button_1.Button variant="ghost" onClick={() => router.push("/settings")} className="mb-4"> <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/> Back to Settings </button_1.Button> <div> <h2 className="text-2xl font-bold text-gray-900"> Session Management </h2> <p className="mt-1 text-gray-500"> Manage your active sessions and sign out from devices </p> </div> <alert_1.Alert> <lucide_react_1.AlertCircle className="h-4 w-4"/> <alert_1.AlertDescription> You are currently signed in on {sessions.length} device {sessions.length !== 1 ? "s" : ""}. If you see any unfamiliar sessions, revoke them immediately and change your password. </alert_1.AlertDescription> </alert_1.Alert> {/* Revoke All Button */} {sessions.filter(s => !s.is_current).length > 0 && (<div className="flex justify-end"> <button_1.Button variant="outline" onClick={revokeAllSessions} disabled={loading} className="text-red-600 hover:text-red-700"> <lucide_react_1.LogOut className="mr-2 h-4 w-4"/> Sign Out All Other Devices </button_1.Button> </div>)} {/* Sessions List */} <div className="space-y-4"> {sessions.length === 0 ? (<div className="rounded-lg bg-gray-50 py-12 text-center"> <lucide_react_1.Monitor className="mx-auto mb-4 h-16 w-16 text-gray-500"/> <p className="text-gray-500"> No active sessions found </p> </div>) : (sessions.map(session => (<div key={session.id} className={`rounded-lg border-2 p-6 transition-all ${session.is_current ? "border-green-500 bg-green-50" : "border-gray-300 bg-white"} `}> <div className="flex items-start gap-4"> <div className="mt-1 shrink-0"> {getDeviceIcon(session.device_type)} </div> <div className="min-w-0 flex-1"> <div className="flex items-start justify-between gap-4"> <div> <div className="flex items-center gap-2"> <h3 className="font-semibold text-gray-900"> {session.device_name} </h3> {session.is_current && (<span className="rounded bg-green-600 px-2 py-0.5 text-xs font-medium text-white"> Current </span>)} </div> <p className="mt-1 text-sm text-gray-600"> {session.browser} on {session.os} </p> </div> {!session.is_current && (<button_1.Button variant="outline" size="sm" onClick={() => revokeSession(session.id)} disabled={revoking === session.id} className="text-red-600 hover:text-red-700"> <lucide_react_1.LogOut className="mr-1 h-4 w-4"/> {revoking === session.id ? "Signing out..." : "Sign Out"} </button_1.Button>)} </div> <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-3"> <div className="flex items-center gap-2 text-gray-600"> <lucide_react_1.MapPin className="h-4 w-4"/> <div> <div className="font-medium text-gray-900"> Location </div> <div>{session.location || "Unknown"}</div> </div> </div> <div className="flex items-center gap-2 text-gray-600"> <lucide_react_1.Monitor className="h-4 w-4"/> <div> <div className="font-medium text-gray-900"> IP Address </div> <div className="font-mono">{session.ip_address}</div> </div> </div> <div className="flex items-center gap-2 text-gray-600"> <lucide_react_1.Clock className="h-4 w-4"/> <div> <div className="font-medium text-gray-900"> Last Active </div> <div>{formatDate(session.last_active)}</div> </div> </div> </div> <div className="mt-3 text-xs text-gray-500"> Signed in {formatDate(session.created_at)} </div> </div> </div> </div>)))} </div> {/* Security Tips */} <div className="rounded-lg border border-blue-200 bg-blue-50 p-4"> <h4 className="mb-2 font-medium text-blue-900"> Security Tips </h4> <ul className="list-inside list-disc space-y-1 text-sm text-blue-800"> <li>Regularly review your active sessions</li> <li>Sign out from devices you no longer use</li> <li> If you see unfamiliar sessions, change your password immediately </li> <li>Enable two-factor authentication for extra security</li> </ul> </div> </div>);
}
