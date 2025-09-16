import React from 'react';
interface SubmitSectionProps {
    formData: any;
    onSubmit: (action: 'draft' | 'submit') => void;
    isSubmitting: boolean;
}
export declare function SubmitSection({ formData, onSubmit, isSubmitting }: SubmitSectionProps): React.JSX.Element;
export {};
