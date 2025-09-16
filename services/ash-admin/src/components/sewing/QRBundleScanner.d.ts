import React from 'react';
interface Bundle {
    id: string;
    order_id: string;
    size_code: string;
    qty: number;
    qr_code: string;
    status: 'CREATED' | 'IN_SEWING' | 'DONE' | 'REJECTED';
    order: {
        order_number: string;
        brand: {
            name: string;
            code: string;
        };
        line_items: Array<{
            description: string;
        }>;
    };
    created_at: string;
}
interface QRBundleScannerProps {
    onBundleScanned: (bundle: Bundle) => void;
    disabled?: boolean;
    className?: string;
}
export default function QRBundleScanner({ onBundleScanned, disabled, className }: QRBundleScannerProps): React.JSX.Element;
export type { Bundle, QRBundleScannerProps };
