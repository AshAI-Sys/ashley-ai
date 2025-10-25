import React from "react";
interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    success?: string;
    hint?: string;
    required?: boolean; /** * Show validation icons */
    showIcons?: boolean;
}
export declare function FormField({ label, error, success, hint, required, showIcons, className, ...props }: FormFieldProps): React.JSX.Element; /** * Form Select with Validation */
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    options: Array<{
        value: string;
        label: string;
    }>;
    placeholder?: string;
}
export declare function FormSelect({ label, error, hint, required, options, placeholder, className, ...props }: FormSelectProps): React.JSX.Element; /** * Form Textarea with Validation */
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean; /** * Show character count */
    showCharCount?: boolean; /** * Maximum characters */
    maxLength?: number;
}
export declare function FormTextarea({ label, error, hint, required, showCharCount, maxLength, className, value, ...props }: FormTextareaProps): React.JSX.Element; /** * Form Validation Summary * Shows all validation errors at once */
interface FormValidationSummaryProps {
    errors: Array<{
        field: string;
        message: string;
    }>;
    className?: string;
}
export declare function FormValidationSummary({ errors, className, }: FormValidationSummaryProps): React.JSX.Element; /** * Inline Validation Message * Lightweight validation feedback */
interface ValidationMessageProps {
    type: "error" | "success" | "warning" | "info";
    message: string;
    className?: string;
}
export declare function ValidationMessage({ type, message, className, }: ValidationMessageProps): React.JSX.Element; /** * Form Progress Indicator * Shows completion status of multi-step forms */
interface FormProgressProps {
    currentStep: number;
    totalSteps: number;
    steps?: Array<{
        label: string;
        completed?: boolean;
    }>;
    className?: string;
}
export declare function FormProgress({ currentStep, totalSteps, steps, className, }: FormProgressProps): React.JSX.Element;
export {};
