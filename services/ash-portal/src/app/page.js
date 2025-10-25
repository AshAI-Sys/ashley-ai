"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomePage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
function HomePage() {
    const [email, setEmail] = (0, react_1.useState)("");
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const handleMagicLink = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch("/api/portal/auth/magic-link", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to send magic link");
            }
            react_hot_toast_1.default.success(data.message);
            // In development, auto-redirect if magic link is provided
            if (data.magicLink && process.env.NODE_ENV === "development") {
                react_hot_toast_1.default.success("Development: Auto-redirecting in 2 seconds...");
                setTimeout(() => {
                    // Extract token from magic link and verify it
                    const token = data.magicLink.split("token=")[1];
                    verifyToken(token);
                }, 2000);
            }
        }
        catch (error) {
            react_hot_toast_1.default.error(error instanceof Error ? error.message : "Failed to send magic link");
        }
        finally {
            setIsLoading(false);
        }
    };
    const verifyToken = async (token) => {
        try {
            const response = await fetch("/api/portal/auth/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Invalid token");
            }
            react_hot_toast_1.default.success(`Welcome ${data.client.name}!`);
            router.push("/dashboard");
        }
        catch (error) {
            react_hot_toast_1.default.error(error instanceof Error ? error.message : "Failed to verify token");
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <lucide_react_1.ShirtIcon className="h-8 w-8 text-blue-600"/>
            <h1 className="text-2xl font-bold text-gray-900">ASH AI Portal</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Welcome to Your Manufacturing Portal
            </h2>
            <p className="mb-8 text-xl text-gray-600">
              Track your orders, approve designs, and manage payments - all in
              one place
            </p>
          </div>

          {/* Features Grid */}
          <div className="mb-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <lucide_react_1.Eye className="h-8 w-8 text-blue-600"/>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Real-time Tracking</h3>
              <p className="text-gray-600">
                Monitor your orders from cutting to delivery with live updates
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <lucide_react_1.ShirtIcon className="h-8 w-8 text-green-600"/>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Design Approval</h3>
              <p className="text-gray-600">
                Review and approve design assets before production starts
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <lucide_react_1.CreditCard className="h-8 w-8 text-purple-600"/>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Easy Payments</h3>
              <p className="text-gray-600">
                Pay invoices online with multiple payment options
              </p>
            </div>
          </div>

          {/* Login Card */}
          <card_1.Card className="mx-auto max-w-md">
            <card_1.CardHeader>
              <card_1.CardTitle>Access Your Account</card_1.CardTitle>
              <card_1.CardDescription>
                Enter your email to receive a secure login link
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="email">Email Address</label_1.Label>
                  <input_1.Input id="email" type="email" placeholder="your.email@company.com" value={email} onChange={e => setEmail(e.target.value)} required/>
                </div>
                <button_1.Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Magic Link"}
                </button_1.Button>
              </form>

              <div className="mt-6 border-t pt-6 text-center">
                <p className="text-sm text-gray-600">
                  Need help? Contact your account manager or email{" "}
                  <a href="mailto:support@ash-ai.com" className="text-blue-600 hover:underline">
                    support@ash-ai.com
                  </a>
                </p>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Trust Indicators */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center space-x-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <lucide_react_1.Truck className="h-5 w-5"/>
                <span className="text-sm">Secure Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <lucide_react_1.CreditCard className="h-5 w-5"/>
                <span className="text-sm">Encrypted Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <lucide_react_1.ShirtIcon className="h-5 w-5"/>
                <span className="text-sm">Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-gray-900 py-8 text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <lucide_react_1.ShirtIcon className="h-6 w-6"/>
                <span className="text-lg font-semibold">ASH AI</span>
              </div>
              <p className="text-gray-400">
                AI-powered apparel manufacturing with end-to-end production
                coverage
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Custom Manufacturing</li>
                <li>Design Services</li>
                <li>Quality Control</li>
                <li>Logistics & Delivery</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>Order Status</li>
                <li>Payment Help</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 ASH AI. All rights reserved. Powered by artificial
              intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>);
}
