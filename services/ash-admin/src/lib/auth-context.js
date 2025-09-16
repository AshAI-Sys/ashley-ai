'use client';
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
const react_1 = __importStar(require("react"));
const api_1 = require("./api");
exports.AuthContext = (0, react_1.createContext)(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0, react_1.useState)(null);
    const [token, setToken] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        // Check for stored token on mount
        const storedToken = localStorage.getItem('ash_token');
        if (storedToken) {
            setToken(storedToken);
            api_1.api.setAuthToken(storedToken);
            // Verify token and get user info
            api_1.api.getCurrentUser()
                .then(({ user }) => {
                setUser(user);
            })
                .catch(() => {
                // Token is invalid, remove it
                localStorage.removeItem('ash_token');
                setToken(null);
            })
                .finally(() => {
                setIsLoading(false);
            });
        }
        else {
            setIsLoading(false);
        }
    }, []);
    const login = async (email, password, workspaceSlug) => {
        try {
            const response = await api_1.api.login(email, password, workspaceSlug);
            setUser(response.user);
            setToken(response.access_token);
            // Store token
            localStorage.setItem('ash_token', response.access_token);
            api_1.api.setAuthToken(response.access_token);
            // TODO: Store refresh token securely
        }
        catch (error) {
            throw error;
        }
    };
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('ash_token');
        api_1.api.setAuthToken(null);
    };
    return (<exports.AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isLoading
        }}>
      {children}
    </exports.AuthContext.Provider>);
}
