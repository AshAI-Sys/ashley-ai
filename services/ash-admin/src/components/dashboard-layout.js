'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardLayout;
const sidebar_1 = __importDefault(require("./sidebar"));
function DashboardLayout({ children }) {
    return (<div className="flex min-h-screen bg-gray-50">
      <sidebar_1.default />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>);
}
