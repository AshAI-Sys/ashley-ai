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
exports.ThemeProvider = ThemeProvider;
exports.useTheme = useTheme;
const react_1 = __importStar(require("react"));
const ThemeContext = (0, react_1.createContext)(undefined);
function ThemeProvider({ children }) {
    const [theme, setThemeState] = (0, react_1.useState)("light");
    const [effectiveTheme, setEffectiveTheme] = (0, react_1.useState)("light");
    const [mounted, setMounted] = (0, react_1.useState)(false);
    // Load theme from localStorage on mount
    (0, react_1.useEffect)(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("ashley-ai-theme");
        if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
            setThemeState(savedTheme);
        }
        else {
            // Default to light mode
            setThemeState("light");
        }
    }, []);
    // Calculate effective theme and apply to document
    (0, react_1.useEffect)(() => {
        if (!mounted)
            return;
        let effective = "light";
        if (theme === "system") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            effective = prefersDark ? "dark" : "light";
        }
        else {
            effective = theme;
        }
        setEffectiveTheme(effective);
        // Apply theme to document
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(effective);
        root.style.colorScheme = effective;
        // Save to localStorage
        localStorage.setItem("ashley-ai-theme", theme);
        localStorage.setItem("ash_theme", effective); // For compatibility
    }, [theme, mounted]);
    // Listen for system theme changes when using system theme
    (0, react_1.useEffect)(() => {
        if (theme !== "system")
            return;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            const effective = mediaQuery.matches ? "dark" : "light";
            setEffectiveTheme(effective);
            document.documentElement.classList.toggle("dark", mediaQuery.matches);
            document.documentElement.style.colorScheme = effective;
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);
    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };
    const toggleTheme = () => {
        setThemeState((prev) => {
            if (prev === "light")
                return "dark";
            if (prev === "dark")
                return "light";
            return "light"; // system -> light
        });
    };
    // Always provide context, even when not mounted (prevents "useTheme must be used within ThemeProvider" errors)
    return (<ThemeContext.Provider value={{ theme, setTheme, effectiveTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>);
}
function useTheme() {
    const context = (0, react_1.useContext)(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
