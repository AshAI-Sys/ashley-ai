'use client'

import * as React from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning'
  duration?: number
}

type ToastActionType =
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'UPDATE_TOAST'; id: string; toast: Partial<Toast> }

interface ToasterState {
  toasts: Toast[]
}

const toastReducer = (state: ToasterState, action: ToastActionType): ToasterState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      }
    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, ...action.toast } : t
        ),
      }
    default:
      return state
  }
}

type ToasterContextValue = {
  toasts: Toast[]
  toast: (props: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToasterContext = React.createContext<ToasterContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(toastReducer, { toasts: [] })

  const toast = React.useCallback((props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const duration = props.duration ?? 5000

    dispatch({
      type: 'ADD_TOAST',
      toast: { ...props, id },
    })

    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id })
      }, duration)
    }
  }, [])

  const dismiss = React.useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id })
  }, [])

  return (
    <ToasterContext.Provider value={{ toasts: state.toasts, toast, dismiss }}>
      {children}
      <Toaster />
    </ToasterContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToasterContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const variantStyles = {
    default: 'bg-white border-gray-200 text-gray-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  }

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border shadow-lg
        ${variantStyles[toast.variant || 'default']}
        animate-in slide-in-from-right-full
      `}
    >
      <div className="flex-1">
        {toast.title && (
          <div className="font-semibold text-sm mb-1">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

// Helper function for common toast patterns
export const toast = {
  success: (message: string) => {
    // This will be replaced by actual toast context
    console.log('Success:', message)
  },
  error: (message: string) => {
    console.error('Error:', message)
  },
  info: (message: string) => {
    console.log('Info:', message)
  },
  warning: (message: string) => {
    console.warn('Warning:', message)
  },
}

export { Toaster, ToastItem }
