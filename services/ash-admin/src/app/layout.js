"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const google_1 = require("next/font/google");
require("./globals.css");
const providers_1 = require("@/components/providers");
const react_hot_toast_1 = require("react-hot-toast");
const inter = (0, google_1.Inter)({ subsets: ['latin'] });
exports.metadata = {
    title: 'ASH AI Admin',
    description: 'Apparel Smart Hub - AI-powered Manufacturing ERP',
    icons: {
        icon: '/favicon.ico',
    },
};
function RootLayout({ children, }) {
    return (<html lang="en">
      <body className={inter.className}>
        <providers_1.Providers>
          {children}
          <react_hot_toast_1.Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
            },
        }}/>
        </providers_1.Providers>
      </body>
    </html>);
}
