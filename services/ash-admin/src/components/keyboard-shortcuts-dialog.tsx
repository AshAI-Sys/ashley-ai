'use client'

import React, { useState } from 'react'
import { X, Keyboard, Search } from 'lucide-react'
import { useKeyboardShortcut, globalShortcuts, formatShortcut } from '@/hooks/useKeyboardShortcuts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

/**
 * Keyboard Shortcuts Help Dialog
 * Shows all available keyboard shortcuts
 * Opens with "?" key
 */
export function KeyboardShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Open dialog with "?" key
  useKeyboardShortcut(
    '?',
    () => {
      setIsOpen(true)
    },
    {
      shift: true,
      preventDefault: true,
      ignoreInputFields: true,
    }
  )

  // Close dialog with Escape
  useKeyboardShortcut(
    'Escape',
    () => {
      if (isOpen) {
        setIsOpen(false)
      }
    },
    {
      preventDefault: true,
      ignoreInputFields: false,
    }
  )

  // Filter shortcuts based on search query
  const filteredShortcuts = globalShortcuts
    .map((group) => ({
      ...group,
      shortcuts: group.shortcuts.filter(
        (shortcut) =>
          shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shortcut.keys.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((group) => group.shortcuts.length > 0)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Boost your productivity with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Shortcuts List */}
        <div className="space-y-6">
          {filteredShortcuts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No shortcuts found matching "{searchQuery}"
            </div>
          ) : (
            filteredShortcuts.map((group) => (
              <div key={group.name}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                  {group.name}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {formatShortcut(shortcut.keys).map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span className="text-xs text-muted-foreground mx-0.5">
                                +
                              </span>
                            )}
                            <kbd className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press{' '}
            <kbd className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-muted border border-border rounded">
              ?
            </kbd>{' '}
            anytime to open this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Keyboard Shortcut Badge Component
 * Displays a keyboard shortcut in a badge format
 */
interface KeyboardShortcutBadgeProps {
  keys: string
  className?: string
}

export function KeyboardShortcutBadge({ keys, className = '' }: KeyboardShortcutBadgeProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {formatShortcut(keys).map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-xs text-muted-foreground mx-0.5">+</span>
          )}
          <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </div>
  )
}

/**
 * Global Keyboard Shortcuts Provider
 * Registers all global shortcuts and provides the help dialog
 */
export function GlobalKeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Global navigation shortcuts
  useKeyboardShortcut('h', () => {
    window.location.href = '/dashboard'
  }, { ctrl: true })

  useKeyboardShortcut('o', () => {
    window.location.href = '/orders'
  }, { ctrl: true })

  useKeyboardShortcut('c', () => {
    window.location.href = '/clients'
  }, { ctrl: true })

  // Toggle sidebar
  useKeyboardShortcut('/', () => {
    setIsSidebarOpen(!isSidebarOpen)
  }, { ctrl: true })

  // Print
  useKeyboardShortcut('p', () => {
    window.print()
  }, { ctrl: true })

  return (
    <>
      {children}
      <KeyboardShortcutsDialog />
    </>
  )
}
