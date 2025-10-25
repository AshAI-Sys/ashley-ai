import React from "react";
interface ErrorAlertProps {
    title?: string;
    message: string;
    retry?: () => void;
}
export declare function ErrorAlert({ title, message, retry, }: ErrorAlertProps): React.JSX.Element;
export {};
