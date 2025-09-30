'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = useAuth;
const react_1 = require("react");
const auth_context_1 = require("@/lib/auth-context");
function useAuth() {
    const context = (0, react_1.useContext)(auth_context_1.AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
