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
exports.KeyboardShortcutsDialog = KeyboardShortcutsDialog;
exports.KeyboardShortcutBadge = KeyboardShortcutBadge;
exports.GlobalKeyboardShortcutsProvider = GlobalKeyboardShortcutsProvider;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const useKeyboardShortcuts_1 = require("@/hooks/useKeyboardShortcuts");
const dialog_1 = require("@/components/ui/dialog");
const input_1 = require("@/components/ui/input");
const hydration_safe_icon_1 = __importDefault(require("@/components/hydration-safe-icon"));
/**
 * Keyboard Shortcuts Help Dialog
 * Shows all available keyboard shortcuts
 * Opens with "?" key
 */
function KeyboardShortcutsDialog() {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)("");
    // Open dialog with "?" key
    (0, useKeyboardShortcuts_1.useKeyboardShortcut)("?", () => {
        setIsOpen(true);
    }, {
        shift: true,
        preventDefault: true,
        ignoreInputFields: true,
    });
    // Close dialog with Escape
    (0, useKeyboardShortcuts_1.useKeyboardShortcut)("Escape", () => {
        if (isOpen) {
            setIsOpen(false);
        }
    }, {
        preventDefault: true,
        ignoreInputFields: false,
    });
    // Filter shortcuts based on search query
    const filteredShortcuts = useKeyboardShortcuts_1.globalShortcuts
        .map(group => ({
        ...group,
        shortcuts: group.shortcuts.filter(shortcut => shortcut.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
            shortcut.keys.toLowerCase().includes(searchQuery.toLowerCase())),
    }))
        .filter(group => group.shortcuts.length > 0);
    return (<dialog_1.Dialog open={isOpen} onOpenChange={setIsOpen}>
      <dialog_1.DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <hydration_safe_icon_1.default Icon={lucide_react_1.Keyboard} className="h-5 w-5"/>
            Keyboard Shortcuts
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Boost your productivity with these keyboard shortcuts
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        {/* Search */}
        <div className="relative mb-4">
          <hydration_safe_icon_1.default Icon={lucide_react_1.Search} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
          <input_1.Input type="text" placeholder="Search shortcuts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9"/>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-6">
          {filteredShortcuts.length === 0 ? (<div className="py-8 text-center text-muted-foreground">
              No shortcuts found matching "{searchQuery}"
            </div>) : (filteredShortcuts.map(group => (<div key={group.name}>
                <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
                  {group.name}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (<div key={index} className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted/50">
                      <span className="text-sm text-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {(0, useKeyboardShortcuts_1.formatShortcut)(shortcut.keys).map((key, keyIndex) => (<react_1.default.Fragment key={keyIndex}>
                            {keyIndex > 0 && (<span className="mx-0.5 text-xs text-muted-foreground">
                                +
                              </span>)}
                            <kbd className="inline-flex h-7 min-w-[2rem] items-center justify-center rounded border border-border bg-muted px-2 text-xs font-semibold text-foreground shadow-sm">
                              {key}
                            </kbd>
                          </react_1.default.Fragment>))}
                      </div>
                    </div>))}
                </div>
              </div>)))}
        </div>

        {/* Footer */}
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-center text-xs text-muted-foreground">
            Press{" "}
            <kbd className="inline-flex items-center justify-center rounded border border-border bg-muted px-2 py-0.5 text-xs font-semibold">
              ?
            </kbd>{" "}
            anytime to open this dialog
          </p>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
function KeyboardShortcutBadge({ keys, className = "", }) {
    return (<div className={`flex items-center gap-1 ${className}`}>
      {(0, useKeyboardShortcuts_1.formatShortcut)(keys).map((key, index) => (<react_1.default.Fragment key={index}>
          {index > 0 && (<span className="mx-0.5 text-xs text-muted-foreground">+</span>)}
          <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border border-border bg-muted px-1.5 text-xs font-semibold text-foreground shadow-sm">
            {key}
          </kbd>
        </react_1.default.Fragment>))}
    </div>);
}
/**
 * Global Keyboard Shortcuts Provider
 * Registers all global shortcuts and provides the help dialog
 */
function GlobalKeyboardShortcutsProvider({ children, }) {
    const [isSidebarOpen, setIsSidebarOpen] = (0, react_1.useState)(true);
    // Global navigation shortcuts
    (0, useKeyboardShortcuts_1.useKeyboardShortcut)("h", () => {
        window.location.href = "/dashboard";
    }, { ctrl: true });
    (0, useKeyboardShortcuts_1.useKeyboardShortcut)("o", () => {
        window.location.href = "/orders";
    }, { ctrl: true });
    (0, useKeyboardShortcuts_1.useKeyboardShortcut)("c", () => {
        window.location.href = "/clients";
    }, { ctrl: true });
    // Toggle sidebar
    (0, useKeyboardShortcuts_1.useKeyboardShortcut)("/", () => {
        setIsSidebarOpen(!isSidebarOpen);
    }, { ctrl: true });
    // Print
    (0, useKeyboardShortcuts_1.useKeyboardShortcut)("p", () => {
        window.print();
    }, { ctrl: true });
    return (<>
      {children}
      <KeyboardShortcutsDialog />
    </>);
}
