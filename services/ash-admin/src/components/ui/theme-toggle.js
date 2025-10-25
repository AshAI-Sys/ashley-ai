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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeToggle = ThemeToggle;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const ThemeContext_1 = require("@/contexts/ThemeContext");
const button_1 = require("@/components/ui/button");
const hydration_safe_icon_1 = __importDefault(require("@/components/hydration-safe-icon"));
function ThemeToggle() {
    const { theme, setTheme, effectiveTheme } = (0, ThemeContext_1.useTheme)();
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [mounted, setMounted] = (0, react_1.useState)(false);
    const dropdownRef = (0, react_1.useRef)(null);
    // Prevent hydration mismatch - only render after mount
    (0, react_1.useEffect)(() => {
        setMounted(true);
    }, []);
    // Close dropdown when clicking outside
    (0, react_1.useEffect)(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);
    const themes = [
        { value: "light", label: "Light", icon: lucide_react_1.Sun },
        { value: "dark", label: "Dark", icon: lucide_react_1.Moon },
        { value: "system", label: "System", icon: lucide_react_1.Monitor },
    ];
    // Show a static button during SSR/hydration to prevent mismatch
    if (!mounted) {
        return (<div className="relative">
        <button_1.Button variant="ghost" size="sm" className="relative w-9 px-0 hover:bg-accent/10 transition-colors" aria-label="Toggle theme">
          <div className="h-[1.2rem] w-[1.2rem]"/>
        </button_1.Button>
      </div>);
    }
    return (<div className="relative" ref={dropdownRef}>
      <button_1.Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative w-9 px-0 hover:bg-accent/10 transition-colors" aria-label="Toggle theme">
        {/* Sun icon for light mode */}
        <hydration_safe_icon_1.default Icon={lucide_react_1.Sun} className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${effectiveTheme === "dark"
            ? "rotate-90 scale-0"
            : "rotate-0 scale-100"}`}/>
        {/* Moon icon for dark mode */}
        <hydration_safe_icon_1.default Icon={lucide_react_1.Moon} className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${effectiveTheme === "dark"
            ? "rotate-0 scale-100"
            : "-rotate-90 scale-0"}`}/>
      </button_1.Button>

      {/* Dropdown Menu */}
      {isOpen && (<div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-lg border border-border bg-card shadow-lg z-50">
          {themes.map(({ value, label, icon: Icon }) => (<button key={value} onClick={() => {
                    setTheme(value);
                    setIsOpen(false);
                }} className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-accent/10 transition-colors cursor-pointer">
              <hydration_safe_icon_1.default Icon={Icon} className="mr-2 h-4 w-4"/>
              <span>{label}</span>
              {theme === value && (<span className="ml-auto text-primary font-semibold">✓</span>)}
            </button>))}
        </div>)}
    </div>);
}
