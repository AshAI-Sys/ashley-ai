export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    callback: (event: KeyboardEvent) => void;
    description?: string;
    preventDefault?: boolean;
}
export interface ShortcutGroup {
    name: string;
    shortcuts: Array<{
        keys: string;
        description: string;
        action: () => void;
    }>;
}
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
export declare function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void;
/**
 * Global keyboard shortcuts for Ashley AI
 */
export declare const globalShortcuts: ShortcutGroup[];
/**
 * Format keyboard shortcut for display
 */
export declare function formatShortcut(keys: string): string[];
/**
 * Check if user is typing in an input field
 * Useful to prevent shortcuts when user is typing
 */
export declare function isTyping(): boolean;
/**
 * Hook to register a single keyboard shortcut
 */
export declare function useKeyboardShortcut(key: string, callback: (event: KeyboardEvent) => void, options?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    preventDefault?: boolean;
    ignoreInputFields?: boolean;
}): void;
/**
 * Hook for Escape key
 */
export declare function useEscapeKey(callback: () => void): void;
/**
 * Hook for Ctrl+K (command palette)
 */
export declare function useCommandPalette(callback: () => void): void;
/**
 * Hook for Ctrl+S (save)
 */
export declare function useSaveShortcut(callback: () => void): void;
