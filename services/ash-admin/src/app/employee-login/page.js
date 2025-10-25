"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmployeeLoginPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const checkbox_1 = require("@/components/ui/checkbox");
const lucide_react_1 = require("lucide-react");
function EmployeeLoginPage() {
    const router = (0, navigation_1.useRouter)();
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [rememberMe, setRememberMe] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)("");
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/employee-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (data.success) {
                // Store token
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("user_type", "employee");
                localStorage.setItem("employee_data", JSON.stringify(data.employee));
                // Remember me
                if (rememberMe) {
                    localStorage.setItem("employee_remember_email", email);
                    localStorage.setItem("employee_remember_password", password);
                }
                else {
                    localStorage.removeItem("employee_remember_email");
                    localStorage.removeItem("employee_remember_password");
                }
                // Redirect to employee dashboard
                router.push("/employee");
            }
            else {
                setError(data.error || "Login failed. Please check your credentials.");
            }
        }
        catch (err) {
            console.error("Login error:", err);
            setError("An error occurred. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <card_1.Card className="w-full max-w-md">
        <card_1.CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <lucide_react_1.User className="h-8 w-8 text-white"/>
          </div>
          <card_1.CardTitle className="text-2xl">Employee Login</card_1.CardTitle>
          <card_1.CardDescription>
            Sign in to access your employee dashboard
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <lucide_react_1.AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"/>
                <p className="text-sm text-red-800">{error}</p>
              </div>)}

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <div className="relative">
                <lucide_react_1.User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500"/>
                <input_1.Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@ashley.com" className="pl-10" required disabled={isLoading}/>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>
              <div className="relative">
                <lucide_react_1.Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500"/>
                <input_1.Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" required disabled={isLoading}/>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <checkbox_1.Checkbox id="remember" checked={rememberMe} onCheckedChange={checked => setRememberMe(checked)} disabled={isLoading}/>
              <label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>

            <button_1.Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (<>
                  <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Signing in...
                </>) : ("Sign In")}
            </button_1.Button>

            <div className="border-t pt-4 text-center">
              <p className="text-sm text-gray-600">
                Admin user?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </card_1.CardContent>
      </card_1.Card>

      {/* Info Card */}
      <card_1.Card className="absolute bottom-4 right-4 hidden max-w-sm lg:block">
        <card_1.CardHeader>
          <card_1.CardTitle className="text-sm">Employee Portal</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-2 text-xs text-gray-600">
          <p>✓ View your assigned tasks</p>
          <p>✓ Track production performance</p>
          <p>✓ Check attendance records</p>
          <p>✓ Monitor quality scores</p>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
