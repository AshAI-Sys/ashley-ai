"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomePage;
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
function HomePage() {
    (0, react_1.useEffect)(() => {
        // FORCE LIGHT MODE - Remove any dark class
        if (typeof window !== "undefined") {
            document.documentElement.classList.remove("dark");
            document.body.classList.remove("dark");
            document.documentElement.style.colorScheme = "light";
        }
    }, []);
    return (<div className="light flex min-h-screen items-center justify-center p-4 font-sans" style={{ backgroundColor: "#F8FAFC", colorScheme: "light" }}>
      <div className="corporate-card max-w-lg p-12 text-center">
        {/* Professional Logo */}
        <div className="mb-8">
          <div className="mx-auto h-24 w-24">
            <img src="/ash-ai-logo.png" alt="Ashley AI Logo" className="h-full w-full object-contain"/>
          </div>
        </div>

        {/* Professional Heading */}
        <h1 style={{
            fontSize: "3rem",
            fontWeight: "700",
            marginBottom: "0.75rem",
            letterSpacing: "-0.02em",
            color: "#111827",
            lineHeight: "1.2",
        }}>
          Ashley AI Admin
        </h1>

        <p style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            marginBottom: "2.5rem",
            color: "#4B5563",
            lineHeight: "1.6",
        }}>
          Apparel Smart Hub - Artificial Intelligence
        </p>

        {/* Professional CTA Button */}
        <link_1.default href="/login" className="inline-block w-full rounded-xl bg-corporate-blue px-6 py-4 text-base font-semibold text-white shadow-corporate transition-all hover:bg-blue-700 hover:shadow-corporate-hover">
          Access Production System
        </link_1.default>

        {/* Professional Footer */}
        <div style={{
            marginTop: "2rem",
            paddingTop: "2rem",
            borderTop: "1px solid #E5E7EB",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            fontSize: "0.875rem",
            fontWeight: "600",
            color: "#4B5563",
        }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <svg style={{ width: "1rem", height: "1rem", color: "#2563EB" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
              </svg>
              <span style={{ color: "#4B5563" }}>Manufacturing ERP</span>
            </span>
            <span style={{ color: "#9CA3AF" }}>•</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <svg style={{ width: "1rem", height: "1rem", color: "#2563EB" }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z"/>
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd"/>
              </svg>
              <span style={{ color: "#4B5563" }}>AI-Powered</span>
            </span>
            <span style={{ color: "#9CA3AF" }}>•</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <svg style={{ width: "1rem", height: "1rem", color: "#2563EB" }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
              <span style={{ color: "#4B5563" }}>Real-Time Analytics</span>
            </span>
          </div>
        </div>
      </div>
    </div>);
}
