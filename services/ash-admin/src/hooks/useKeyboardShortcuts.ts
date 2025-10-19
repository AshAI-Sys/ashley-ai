'use client'

import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  callback: (event: KeyboardEvent) => void
  description?: string
  preventDefault?: boolean
}

export interface ShortcutGroup {
  name: string
  shortcuts: Array<{
    keys: string
    description: string
    action: () => void
  }>
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
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const shortcutsRef = useRef(shortcuts)

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const shortcuts = shortcutsRef.current

    for (const shortcut of shortcuts) {
      const {
        key,
        ctrl = false,
        alt = false,
        shift = false,
        meta = false,
        callback,
        preventDefault = true,
      } = shortcut

      // Check if the key matches
      const keyMatches = event.key.toLowerCase() === key.toLowerCase()

      // Check if modifiers match
      const ctrlMatches = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
      const altMatches = alt ? event.altKey : !event.altKey
      const shiftMatches = shift ? event.shiftKey : !event.shiftKey
      const metaMatches = meta ? event.metaKey : !event.metaKey && !event.ctrlKey

      if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
        if (preventDefault) {
          event.preventDefault()
        }
        callback(event)
        break
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

/**
 * Global keyboard shortcuts for Ashley AI
 */
export const globalShortcuts: ShortcutGroup[] = [
  {
    name: 'Navigation',
    shortcuts: [
      { keys: 'Ctrl+K', description: 'Open global search', action: () => {} },
      { keys: 'Ctrl+/', description: 'Toggle sidebar', action: () => {} },
      { keys: 'Ctrl+H', description: 'Go to dashboard', action: () => {} },
      { keys: 'Ctrl+O', description: 'Go to orders', action: () => {} },
      { keys: 'Ctrl+C', description: 'Go to clients', action: () => {} },
    ],
  },
  {
    name: 'Actions',
    shortcuts: [
      { keys: 'Ctrl+N', description: 'Create new order', action: () => {} },
      { keys: 'Ctrl+S', description: 'Save current form', action: () => {} },
      { keys: 'Esc', description: 'Close dialog/modal', action: () => {} },
      { keys: 'Ctrl+P', description: 'Print current page', action: () => {} },
    ],
  },
  {
    name: 'View',
    shortcuts: [
      { keys: 'Ctrl+T', description: 'Toggle dark mode', action: () => {} },
      { keys: 'Ctrl+B', description: 'Toggle sidebar', action: () => {} },
      { keys: 'Ctrl+,', description: 'Open settings', action: () => {} },
    ],
  },
  {
    name: 'Help',
    shortcuts: [
      { keys: '?', description: 'Show keyboard shortcuts', action: () => {} },
      { keys: 'Ctrl+Shift+H', description: 'Open help center', action: () => {} },
    ],
  },
]

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(keys: string): string[] {
  return keys.split('+').map((key) => {
    switch (key.toLowerCase()) {
      case 'ctrl':
        return 'Ctrl'
      case 'alt':
        return 'Alt'
      case 'shift':
        return 'Shift'
      case 'meta':
      case 'cmd':
        return '⌘'
      default:
        return key.toUpperCase()
    }
  })
}

/**
 * Check if user is typing in an input field
 * Useful to prevent shortcuts when user is typing
 */
export function isTyping(): boolean {
  const activeElement = document.activeElement
  const tagName = activeElement?.tagName.toLowerCase()
  const isEditable = (activeElement as HTMLElement)?.isContentEditable

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    isEditable ||
    false
  )
}

/**
 * Hook to register a single keyboard shortcut
 */
export function useKeyboardShortcut(
  key: string,
  callback: (event: KeyboardEvent) => void,
  options: {
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
    preventDefault?: boolean
    ignoreInputFields?: boolean
  } = {}
) {
  const {
    ctrl = false,
    alt = false,
    shift = false,
    meta = false,
    preventDefault = true,
    ignoreInputFields = true,
  } = options

  useKeyboardShortcuts([
    {
      key,
      ctrl,
      alt,
      shift,
      meta,
      callback: (event) => {
        // Don't trigger if user is typing in an input field
        if (ignoreInputFields && isTyping()) {
          return
        }
        callback(event)
      },
      preventDefault,
    },
  ])
}

/**
 * Hook for Escape key
 */
export function useEscapeKey(callback: () => void) {
  useKeyboardShortcut('Escape', callback, {
    preventDefault: true,
    ignoreInputFields: false,
  })
}

/**
 * Hook for Ctrl+K (command palette)
 */
export function useCommandPalette(callback: () => void) {
  useKeyboardShortcut('k', callback, {
    ctrl: true,
    preventDefault: true,
  })
}

/**
 * Hook for Ctrl+S (save)
 */
export function useSaveShortcut(callback: () => void) {
  useKeyboardShortcut('s', callback, {
    ctrl: true,
    preventDefault: true,
  })
}
