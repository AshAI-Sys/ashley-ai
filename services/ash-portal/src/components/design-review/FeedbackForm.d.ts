import React from "react";
interface FeedbackFormProps {
    designName: string;
    version: number;
    onSubmit: (data: FeedbackData) => void;
    submitting?: boolean;
    disabled?: boolean;
    className?: string;
}
interface FeedbackData {
    rating?: number;
    feedback: string;
    change_requests?: string[];
    attachments: File[];
    priority: "low" | "normal" | "high" | "urgent";
}
export declare function FeedbackForm({ designName, version, onSubmit, submitting, disabled, className, }: FeedbackFormProps): React.JSX.Element;
export {};
