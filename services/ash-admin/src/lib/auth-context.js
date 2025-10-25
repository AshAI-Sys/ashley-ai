"use client";
"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthContext = void 0;
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
const react_1 = __importStar(require("react"));
exports.AuthContext = (0, react_1.createContext)(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0, react_1.useState)(null);
    const [token, setToken] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        // Check for stored token on mount (only in browser)
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("ash_token");
            console.log("🔐 AuthContext - Stored token:", storedToken ? "EXISTS" : "NONE");
            if (storedToken) {
                setToken(storedToken);
                // Get stored user data if available
                const storedUser = localStorage.getItem("ash_user");
                console.log("👤 AuthContext - Stored user:", storedUser);
                if (storedUser) {
                    try {
                        const userData = JSON.parse(storedUser);
                        console.log("✅ AuthContext - Parsed user:", userData);
                        setUser(userData);
                    }
                    catch (error) {
                        console.error("❌ Error parsing stored user data:", error);
                        // Clear invalid user data only - keep token for now
                        localStorage.removeItem("ash_user");
                        setUser(null);
                    }
                }
                else {
                    console.log("⚠️ Token found but no user data - will attempt to fetch from API");
                    // Token exists but no user data - this could be a timing issue
                    // Keep the token and let the app try to use it
                    // If it's invalid, the API calls will fail and trigger logout
                }
            }
        }
        setIsLoading(false);
    }, []);
    const login = async (email, password) => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                throw new Error("Invalid credentials");
            }
            const data = await response.json();
            const { access_token, user: userData } = data;
            setUser(userData);
            setToken(access_token);
            localStorage.setItem("ash_token", access_token);
            localStorage.setItem("ash_user", JSON.stringify(userData));
        }
        catch (error) {
            throw new Error("Invalid credentials");
        }
    };
    const logout = () => {
        setUser(null);
        setToken(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem("ash_token");
            localStorage.removeItem("ash_user");
        }
    };
    return (<exports.AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isLoading,
        }}>
      {children}
    </exports.AuthContext.Provider>);
}
// Custom hook to use auth context
function useAuth() {
    const context = (0, react_1.useContext)(exports.AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
