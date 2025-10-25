"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalShortcuts = void 0;
exports.useKeyboardShortcuts = useKeyboardShortcuts;
exports.formatShortcut = formatShortcut;
exports.isTyping = isTyping;
exports.useKeyboardShortcut = useKeyboardShortcut;
exports.useEscapeKey = useEscapeKey;
exports.useCommandPalette = useCommandPalette;
exports.useSaveShortcut = useSaveShortcut;
const react_1 = require("react");
/**
 * Hook to register keyboard shortcuts
 *
 * @example
 * useKeyboardShortcuts([
 *   {
 *     key: 'k',
 *     ctrl: true,
 *     callback: () => openSearch(),
 *     description: 'Open search',
 *   },
 *   {
 *     key: 'n',
 *     ctrl: true,
 *     callback: () => createNew(),
 *     description: 'Create new order',
 *   }
 * ])
 */
function useKeyboardShortcuts(shortcuts) {
    const shortcutsRef = (0, react_1.useRef)(shortcuts);
    // Update ref when shortcuts change
    (0, react_1.useEffect)(() => {
        shortcutsRef.current = shortcuts;
    }, [shortcuts]);
    const handleKeyDown = (0, react_1.useCallback)((event) => {
        const shortcuts = shortcutsRef.current;
        for (const shortcut of shortcuts) {
            const { key, ctrl = false, alt = false, shift = false, meta = false, callback, preventDefault = true, } = shortcut;
            // Check if the key matches (with null safety)
            // Skip if key is undefined
            if (!key || !event.key) {
                continue;
            }
            const keyMatches = event.key.toLowerCase() === key.toLowerCase();
            // Check if modifiers match
            const ctrlMatches = ctrl
                ? event.ctrlKey || event.metaKey
                : !event.ctrlKey && !event.metaKey;
            const altMatches = alt ? event.altKey : !event.altKey;
            const shiftMatches = shift ? event.shiftKey : !event.shiftKey;
            const _metaMatches = meta
                ? event.metaKey
                : !event.metaKey && !event.ctrlKey;
            if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
                if (preventDefault) {
                    event.preventDefault();
                }
                callback(event);
                break;
            }
        }
    }, []);
    (0, react_1.useEffect)(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);
}
/**
 * Global keyboard shortcuts for Ashley AI
 */
exports.globalShortcuts = [
    {
        name: "Navigation",
        shortcuts: [
            { keys: "Ctrl+K", description: "Open global search", action: () => { } },
            { keys: "Ctrl+/", description: "Toggle sidebar", action: () => { } },
            { keys: "Ctrl+H", description: "Go to dashboard", action: () => { } },
            { keys: "Ctrl+O", description: "Go to orders", action: () => { } },
            { keys: "Ctrl+C", description: "Go to clients", action: () => { } },
        ],
    },
    {
        name: "Actions",
        shortcuts: [
            { keys: "Ctrl+N", description: "Create new order", action: () => { } },
            { keys: "Ctrl+S", description: "Save current form", action: () => { } },
            { keys: "Esc", description: "Close dialog/modal", action: () => { } },
            { keys: "Ctrl+P", description: "Print current page", action: () => { } },
        ],
    },
    {
        name: "View",
        shortcuts: [
            { keys: "Ctrl+T", description: "Toggle dark mode", action: () => { } },
            { keys: "Ctrl+B", description: "Toggle sidebar", action: () => { } },
            { keys: "Ctrl+,", description: "Open settings", action: () => { } },
        ],
    },
    {
        name: "Help",
        shortcuts: [
            { keys: "?", description: "Show keyboard shortcuts", action: () => { } },
            {
                keys: "Ctrl+Shift+H",
                description: "Open help center",
                action: () => { },
            },
        ],
    },
];
/**
 * Format keyboard shortcut for display
 */
function formatShortcut(keys) {
    return keys.split("+").map(key => {
        switch (key.toLowerCase()) {
            case "ctrl":
                return "Ctrl";
            case "alt":
                return "Alt";
            case "shift":
                return "Shift";
            case "meta":
            case "cmd":
                return "⌘";
            default:
                return key.toUpperCase();
        }
    });
}
/**
 * Check if user is typing in an input field
 * Useful to prevent shortcuts when user is typing
 */
function isTyping() {
    const activeElement = document.activeElement;
    const tagName = activeElement?.tagName.toLowerCase();
    const isEditable = activeElement?.isContentEditable;
    return (tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        isEditable ||
        false);
}
/**
 * Hook to register a single keyboard shortcut
 */
function useKeyboardShortcut(key, callback, options = {}) {
    const { ctrl = false, alt = false, shift = false, meta = false, preventDefault = true, ignoreInputFields = true, } = options;
    useKeyboardShortcuts([
        {
            key,
            ctrl,
            alt,
            shift,
            meta,
            callback: event => {
                // Don't trigger if user is typing in an input field
                if (ignoreInputFields && isTyping()) {
                    return;
                }
                callback(event);
            },
            preventDefault,
        },
    ]);
}
/**
 * Hook for Escape key
 */
function useEscapeKey(callback) {
    useKeyboardShortcut("Escape", callback, {
        preventDefault: true,
        ignoreInputFields: false,
    });
}
/**
 * Hook for Ctrl+K (command palette)
 */
function useCommandPalette(callback) {
    useKeyboardShortcut("k", callback, {
        ctrl: true,
        preventDefault: true,
    });
}
/**
 * Hook for Ctrl+S (save)
 */
function useSaveShortcut(callback) {
    useKeyboardShortcut("s", callback, {
        ctrl: true,
        preventDefault: true,
    });
}
