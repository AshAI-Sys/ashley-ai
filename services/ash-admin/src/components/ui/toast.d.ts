import * as React from "react";
export interface Toast {
    id: string;
    title?: string;
    description?: string;
    variant?: "default" | "success" | "error" | "warning";
    duration?: number;
}
type ToasterContextValue = {
    toasts: Toast[];
    toast: (props: Omit<Toast, "id">) => void;
    dismiss: (id: string) => void;
};
export declare function ToastProvider({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export declare function useToast(): ToasterContextValue;
declare function Toaster(): React.JSX.Element;
declare function ToastItem({ toast, onDismiss, }: {
    toast: Toast;
    onDismiss: (id: string) => void;
}): React.JSX.Element;
export declare const toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
};
export { Toaster, ToastItem };
