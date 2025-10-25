"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardLayout;
const sidebar_1 = __importDefault(require("./sidebar"));
const top_navbar_1 = __importDefault(require("./top-navbar"));
/**
 * DashboardLayout - Main layout wrapper for authenticated dashboard pages
 * Includes sidebar navigation and top navbar
 */
function DashboardLayout({ children }) {
    return (<div className="flex min-h-screen bg-gray-50">
      <sidebar_1.default />
      <div className="flex flex-1 flex-col overflow-hidden">
        <top_navbar_1.default />
        <main className="flex-1 overflow-auto bg-gray-50 pt-16 lg:pt-0">
          {/* pt-16 on mobile to account for hamburger menu button */}
          {children}
        </main>
      </div>
    </div>);
}
