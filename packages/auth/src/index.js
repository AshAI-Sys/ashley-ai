"use strict";
// ASH AI Authentication Package
// Comprehensive authentication and authorization utilities
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptions = exports.useSession = exports.signOut = exports.signIn = exports.getServerSession = void 0;
// Main exports
__exportStar(require("./config"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./utils"), exports);
__exportStar(require("./middleware"), exports);
__exportStar(require("./hooks"), exports);
__exportStar(require("./components"), exports);
// Re-export NextAuth for convenience
var next_auth_1 = require("next-auth");
Object.defineProperty(exports, "getServerSession", { enumerable: true, get: function () { return next_auth_1.getServerSession; } });
var react_1 = require("next-auth/react");
Object.defineProperty(exports, "signIn", { enumerable: true, get: function () { return react_1.signIn; } });
Object.defineProperty(exports, "signOut", { enumerable: true, get: function () { return react_1.signOut; } });
Object.defineProperty(exports, "useSession", { enumerable: true, get: function () { return react_1.useSession; } });
// Default configuration
var config_1 = require("./config");
Object.defineProperty(exports, "authOptions", { enumerable: true, get: function () { return config_1.authOptions; } });
