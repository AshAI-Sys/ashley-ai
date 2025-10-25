"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
function LoginPage() {
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [rememberMe, setRememberMe] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)("");
    const [loginType, setLoginType] = (0, react_1.useState)("admin");
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    const [redirecting, setRedirecting] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    (0, react_1.useEffect)(() => {
        if (typeof window !== "undefined") {
            // Check if already logged in - redirect to dashboard
            const token = localStorage.getItem("ash_token");
            const user = localStorage.getItem("ash_user");
            if (token && user) {
                console.log("[LOGIN] User already logged in, redirecting to dashboard");
                router.push("/dashboard");
                return;
            }
            // FORCE LIGHT MODE - Remove any dark class from document
            document.documentElement.classList.remove("dark");
            document.body.classList.remove("dark");
            // Set color scheme to light
            document.documentElement.style.colorScheme = "light";
            const savedEmail = localStorage.getItem("ash_remember_email");
            const savedPassword = localStorage.getItem("ash_remember_password");
            if (savedEmail) {
                setEmail(savedEmail);
                setRememberMe(true);
            }
            if (savedPassword) {
                setPassword(savedPassword);
            }
        }
    }, [router]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);
        setError("");
        try {
            const apiEndpoint = loginType === "admin" ? "/api/auth/login" : "/api/auth/employee-login";
            console.log("[LOGIN] Attempting login as", loginType, "to", apiEndpoint);
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            console.log("[LOGIN] Response status:", response.status);
            if (response.ok) {
                const data = await response.json();
                console.log("[LOGIN] Response data received:", {
                    success: data.success,
                    hasToken: !!data.access_token,
                });
                if (data.success && data.access_token) {
                    // Store authentication data
                    try {
                        if (loginType === "admin") {
                            localStorage.setItem("ash_token", data.access_token);
                            localStorage.setItem("ash_user", JSON.stringify(data.user));
                            localStorage.setItem("user_type", "admin");
                            console.log("[LOGIN] Admin data stored in localStorage");
                        }
                        else {
                            localStorage.setItem("access_token", data.access_token);
                            localStorage.setItem("employee_data", JSON.stringify(data.employee));
                            localStorage.setItem("user_type", "employee");
                            console.log("[LOGIN] Employee data stored in localStorage");
                        }
                        if (rememberMe) {
                            localStorage.setItem("ash_remember_email", email);
                            localStorage.setItem("ash_remember_password", password);
                            localStorage.setItem("ash_remember_type", loginType);
                        }
                        else {
                            localStorage.removeItem("ash_remember_email");
                            localStorage.removeItem("ash_remember_password");
                            localStorage.removeItem("ash_remember_type");
                        }
                    }
                    catch (storageError) {
                        console.error("[LOGIN] localStorage error:", storageError);
                        setError("Failed to store login data. Please check browser storage settings.");
                        setIsLoading(false);
                        return;
                    }
                    // Show redirecting state
                    setRedirecting(true);
                    // Redirect with window.location.replace (most reliable)
                    const redirectPath = loginType === "admin" ? "/dashboard" : "/employee";
                    console.log("[LOGIN] Successful login! Redirecting to:", redirectPath);
                    // Use window.location.replace for reliable redirect (no history entry)
                    setTimeout(() => {
                        window.location.replace(redirectPath);
                    }, 300); // Small delay to ensure localStorage is written
                }
                else {
                    console.error("[LOGIN] Invalid response format:", data);
                    setError("Login failed: Invalid response format");
                    setIsLoading(false);
                }
            }
            else {
                const errorData = await response.json().catch(() => ({}));
                console.error("[LOGIN] Login failed:", errorData);
                setError(errorData.error || "Invalid credentials. Please try again.");
                setIsLoading(false);
            }
        }
        catch (err) {
            console.error("[LOGIN] Exception:", err);
            setError("Login failed. Please check your connection and try again.");
            setIsLoading(false);
        }
    };
    return (<div className="light flex min-h-screen items-center justify-center p-4 font-sans" style={{ backgroundColor: "#F8FAFC", colorScheme: "light" }}>
      {/* Redirecting Overlay */}
      {redirecting && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="corporate-card mx-4 w-full max-w-sm p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full border-4 border-corporate-blue bg-blue-50">
              <svg className="h-8 w-8 animate-spin text-corporate-blue" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Redirecting...
            </h3>
            <p className="text-sm text-gray-600">
              Taking you to your dashboard
            </p>
          </div>
        </div>)}

      <div className="corporate-card w-full max-w-md p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-20 w-20">
            <img src="/ash-ai-logo.png" alt="Ashley AI Logo" className="h-full w-full object-contain"/>
          </div>

          <h1 className="mb-2 text-3xl font-bold" style={{ color: "#000000" }}>
            Sign In
          </h1>
          <p className="text-base font-semibold" style={{ color: "#374151" }}>
            Access your Ashley AI Dashboard
          </p>
        </div>

        {/* Login Type Toggle */}
        <div className="mb-6 flex gap-2">
          <button type="button" onClick={() => setLoginType("admin")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium transition-all ${loginType === "admin"
            ? "bg-corporate-blue text-white shadow-corporate"
            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
            </svg>
            Admin
          </button>

          <button type="button" onClick={() => setLoginType("employee")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium transition-all ${loginType === "employee"
            ? "bg-corporate-blue text-white shadow-corporate"
            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
            Employee
          </button>
        </div>

        {error && (<div className="mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {error}
          </div>)}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold" style={{ color: "#000000" }}>
              Email
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" required className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3.5 text-base font-medium placeholder-gray-500 transition-all focus:border-corporate-blue focus:outline-none focus:ring-2 focus:ring-corporate-blue" style={{ backgroundColor: "#FFFFFF", color: "#000000" }}/>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold" style={{ color: "#000000" }}>
              Password
            </label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3.5 pr-12 text-base font-medium placeholder-gray-500 transition-all focus:border-corporate-blue focus:outline-none focus:ring-2 focus:ring-corporate-blue" style={{ backgroundColor: "#FFFFFF", color: "#000000" }}/>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 transition-colors hover:text-gray-900">
                {showPassword ? (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>) : (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>)}
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <label className="flex cursor-pointer select-none items-center text-sm font-semibold transition-colors" style={{ color: "#000000" }}>
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="mr-2 h-4 w-4 cursor-pointer rounded accent-corporate-blue"/>
              Remember my account
            </label>
            <link_1.default href="/forgot-password" className="text-sm font-semibold text-corporate-blue transition-colors hover:text-blue-700">
              Forgot Password?
            </link_1.default>
          </div>

          <button type="submit" disabled={isLoading} className={`w-full rounded-lg py-3 text-sm font-semibold transition-all ${isLoading
            ? "cursor-not-allowed bg-gray-300 text-gray-500"
            : "bg-corporate-blue text-white shadow-corporate hover:bg-blue-700 hover:shadow-corporate-hover"}`}>
            {isLoading
            ? "Signing In..."
            : `Sign In as ${loginType === "admin" ? "Admin" : "Employee"}`}
          </button>
        </form>

        {/* Create New Account - Only show for Admin */}
        {loginType === "admin" && (<div className="mt-6">
            <link_1.default href="/register" className="block w-full rounded-lg border-2 border-corporate-blue bg-white py-3 text-center text-sm font-semibold text-corporate-blue transition-all hover:bg-blue-50">
              Create New Account
            </link_1.default>
          </div>)}

        <div className="border-t border-gray-200 pt-6">
          <div className="text-center">
            <link_1.default href="/" className="inline-flex items-center gap-1 text-sm font-semibold transition-colors" style={{ color: "#374151" }}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to Home
            </link_1.default>
          </div>
        </div>
      </div>
    </div>);
}
