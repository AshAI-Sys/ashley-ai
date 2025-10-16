import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'

/**
 * Form Field with Validation
 * Enhanced input component with built-in validation feedback
 */

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: string
  hint?: string
  required?: boolean
  /**
   * Show validation icons
   */
  showIcons?: boolean
}

export function FormField({
  label,
  error,
  success,
  hint,
  required,
  showIcons = true,
  className,
  ...props
}: FormFieldProps) {
  const hasError = !!error
  const hasSuccess = !!success && !error

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>

      <div className="relative">
        <input
          className={cn(
            'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm',
            'ring-offset-background file:border-0 file:bg-transparent',
            'file:text-sm file:font-medium placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError && 'border-destructive focus-visible:ring-destructive pr-10',
            hasSuccess && 'border-green-500 focus-visible:ring-green-500 pr-10',
            !hasError && !hasSuccess && 'border-input',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined
          }
          {...props}
        />

        {showIcons && (hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError && (
              <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
            )}
            {hasSuccess && (
              <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      {error && (
        <p
          id={`${props.id}-error`}
          className="text-sm font-medium text-destructive flex items-start gap-1.5"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {success && !error && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-start gap-1.5">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </p>
      )}

      {hint && !error && !success && (
        <p
          id={`${props.id}-hint`}
          className="text-sm text-muted-foreground flex items-start gap-1.5"
        >
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{hint}</span>
        </p>
      )}
    </div>
  )
}

/**
 * Form Select with Validation
 */
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  hint?: string
  required?: boolean
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export function FormSelect({
  label,
  error,
  hint,
  required,
  options,
  placeholder = 'Select an option',
  className,
  ...props
}: FormSelectProps) {
  const hasError = !!error

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>

      <select
        className={cn(
          'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-destructive focus-visible:ring-destructive',
          !hasError && 'border-input',
          className
        )}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined
        }
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p
          id={`${props.id}-error`}
          className="text-sm font-medium text-destructive flex items-start gap-1.5"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {hint && !error && (
        <p
          id={`${props.id}-hint`}
          className="text-sm text-muted-foreground flex items-start gap-1.5"
        >
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{hint}</span>
        </p>
      )}
    </div>
  )
}

/**
 * Form Textarea with Validation
 */
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
  required?: boolean
  /**
   * Show character count
   */
  showCharCount?: boolean
  /**
   * Maximum characters
   */
  maxLength?: number
}

export function FormTextarea({
  label,
  error,
  hint,
  required,
  showCharCount,
  maxLength,
  className,
  value,
  ...props
}: FormTextareaProps) {
  const hasError = !!error
  const charCount = typeof value === 'string' ? value.length : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
        {showCharCount && maxLength && (
          <span
            className={cn(
              'text-xs text-muted-foreground',
              charCount > maxLength && 'text-destructive'
            )}
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-destructive focus-visible:ring-destructive',
          !hasError && 'border-input',
          className
        )}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined
        }
        maxLength={maxLength}
        value={value}
        {...props}
      />

      {error && (
        <p
          id={`${props.id}-error`}
          className="text-sm font-medium text-destructive flex items-start gap-1.5"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {hint && !error && (
        <p
          id={`${props.id}-hint`}
          className="text-sm text-muted-foreground flex items-start gap-1.5"
        >
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{hint}</span>
        </p>
      )}
    </div>
  )
}

/**
 * Form Validation Summary
 * Shows all validation errors at once
 */
interface FormValidationSummaryProps {
  errors: Array<{ field: string; message: string }>
  className?: string
}

export function FormValidationSummary({
  errors,
  className
}: FormValidationSummaryProps) {
  if (errors.length === 0) return null

  return (
    <div
      className={cn(
        'rounded-md border border-destructive/50 bg-destructive/10 p-4',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <h3 className="text-sm font-semibold text-destructive">
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-destructive/90">
                <span className="font-medium">{error.field}:</span> {error.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * Inline Validation Message
 * Lightweight validation feedback
 */
interface ValidationMessageProps {
  type: 'error' | 'success' | 'warning' | 'info'
  message: string
  className?: string
}

export function ValidationMessage({
  type,
  message,
  className
}: ValidationMessageProps) {
  const styles = {
    error: {
      icon: AlertCircle,
      className: 'text-destructive'
    },
    success: {
      icon: CheckCircle2,
      className: 'text-green-600 dark:text-green-400'
    },
    warning: {
      icon: AlertTriangle,
      className: 'text-yellow-600 dark:text-yellow-400'
    },
    info: {
      icon: Info,
      className: 'text-blue-600 dark:text-blue-400'
    }
  }

  const { icon: Icon, className: typeClass } = styles[type]

  return (
    <p
      className={cn('text-sm flex items-start gap-1.5', typeClass, className)}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </p>
  )
}

/**
 * Form Progress Indicator
 * Shows completion status of multi-step forms
 */
interface FormProgressProps {
  currentStep: number
  totalSteps: number
  steps?: Array<{ label: string; completed?: boolean }>
  className?: string
}

export function FormProgress({
  currentStep,
  totalSteps,
  steps,
  className
}: FormProgressProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {steps && steps.length > 0 && (
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                'flex flex-col items-center gap-1',
                index + 1 < currentStep && 'text-green-600',
                index + 1 === currentStep && 'text-primary font-medium',
                index + 1 > currentStep && 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2',
                  index + 1 < currentStep && 'border-green-600 bg-green-50 dark:bg-green-950',
                  index + 1 === currentStep && 'border-primary bg-primary/10',
                  index + 1 > currentStep && 'border-muted bg-background'
                )}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <span className="text-xs max-w-[80px] text-center truncate">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
