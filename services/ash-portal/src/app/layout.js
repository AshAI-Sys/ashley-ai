"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const google_1 = require("next/font/google");
require("./globals.css");
const providers_1 = require("@/components/providers");
const react_hot_toast_1 = require("react-hot-toast");
const inter = (0, google_1.Inter)({ subsets: ["latin"] });
exports.metadata = {
    title: "Ashley AI Portal",
    description: "Ashley AI Client Portal - Track your orders and manage your account",
    icons: {
        icon: "/favicon.png",
        shortcut: "/favicon.png",
        apple: "/ash-ai-logo.png",
    },
};
function RootLayout({ children, }) {
    return (<html lang="en">
      <body className={inter.className}>
        <providers_1.Providers>
          {children}
          <react_hot_toast_1.Toaster position="bottom-right" toastOptions={{
            duration: 4000,
            style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
            },
        }}/>
        </providers_1.Providers>
      </body>
    </html>);
}
