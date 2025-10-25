import React from "react";
/**
 * Keyboard Shortcuts Help Dialog
 * Shows all available keyboard shortcuts
 * Opens with "?" key
 */
export declare function KeyboardShortcutsDialog(): React.JSX.Element;
/**
 * Keyboard Shortcut Badge Component
 * Displays a keyboard shortcut in a badge format
 */
interface KeyboardShortcutBadgeProps {
    keys: string;
    className?: string;
}
export declare function KeyboardShortcutBadge({ keys, className, }: KeyboardShortcutBadgeProps): React.JSX.Element;
/**
 * Global Keyboard Shortcuts Provider
 * Registers all global shortcuts and provides the help dialog
 */
export declare function GlobalKeyboardShortcutsProvider({ children, }: {
    children: React.ReactNode;
}): React.JSX.Element;
export {};
