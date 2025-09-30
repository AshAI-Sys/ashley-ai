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
exports.PopoverContent = exports.PopoverTrigger = exports.Popover = void 0;
const React = __importStar(require("react"));
const utils_1 = require("@/lib/utils");
const PopoverContext = React.createContext(undefined);
const Popover = ({ open = false, onOpenChange, children }) => {
    return (<PopoverContext.Provider value={{ open, onOpenChange: onOpenChange || (() => { }) }}>
      {children}
    </PopoverContext.Provider>);
};
exports.Popover = Popover;
const PopoverTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    return (<button ref={ref} onClick={() => context?.onOpenChange(!context.open)} className={className} {...props}>
      {children}
    </button>);
});
exports.PopoverTrigger = PopoverTrigger;
PopoverTrigger.displayName = "PopoverTrigger";
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, children, ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    if (!context?.open)
        return null;
    return (<>
        {/* Backdrop */}
        <div className="fixed inset-0 z-40" onClick={() => context.onOpenChange(false)}/>
        
        {/* Content */}
        <div ref={ref} className={(0, utils_1.cn)("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none", "absolute top-full mt-1", // Simple positioning
        className)} {...props}>
          {children}
        </div>
      </>);
});
exports.PopoverContent = PopoverContent;
PopoverContent.displayName = "PopoverContent";
