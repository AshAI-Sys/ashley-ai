'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomePage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const ui_1 = require("@ash/ui");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
function HomePage() {
    const [email, setEmail] = (0, react_1.useState)('');
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const handleMagicLink = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // TODO: Implement magic link API call
            react_hot_toast_1.default.success('Magic link sent to your email!');
            // Simulate redirect after successful magic link
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        }
        catch (error) {
            react_hot_toast_1.default.error('Failed to send magic link');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <lucide_react_1.ShirtIcon className="h-8 w-8 text-blue-600"/>
            <h1 className="text-2xl font-bold text-gray-900">ASH AI Portal</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your Manufacturing Portal
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Track your orders, approve designs, and manage payments - all in one place
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <lucide_react_1.Eye className="h-8 w-8 text-blue-600"/>
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">
                Monitor your orders from cutting to delivery with live updates
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <lucide_react_1.ShirtIcon className="h-8 w-8 text-green-600"/>
              </div>
              <h3 className="text-lg font-semibold mb-2">Design Approval</h3>
              <p className="text-gray-600">
                Review and approve design assets before production starts
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <lucide_react_1.CreditCard className="h-8 w-8 text-purple-600"/>
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Payments</h3>
              <p className="text-gray-600">
                Pay invoices online with multiple payment options
              </p>
            </div>
          </div>

          {/* Login Card */}
          <card_1.Card className="max-w-md mx-auto">
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
                  <input_1.Input id="email" type="email" placeholder="your.email@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>
                <ui_1.Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Magic Link'}
                </ui_1.Button>
              </form>
              
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-600">
                  Need help? Contact your account manager or email{' '}
                  <a href="mailto:support@ash-ai.com" className="text-blue-600 hover:underline">
                    support@ash-ai.com
                  </a>
                </p>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Trust Indicators */}
          <div className="text-center mt-12">
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
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <lucide_react_1.ShirtIcon className="h-6 w-6"/>
                <span className="text-lg font-semibold">ASH AI</span>
              </div>
              <p className="text-gray-400">
                AI-powered apparel manufacturing with end-to-end production coverage
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Custom Manufacturing</li>
                <li>Design Services</li>
                <li>Quality Control</li>
                <li>Logistics & Delivery</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>Order Status</li>
                <li>Payment Help</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ASH AI. All rights reserved. Powered by artificial intelligence.</p>
          </div>
        </div>
      </footer>
    </div>);
}
