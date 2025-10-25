/**
 * QR/Barcode Scanner Component
 * Uses device camera to scan QR codes and barcodes
 */
interface ScannerProps {
    onScan: (code: string, format: string) => void;
    onClose?: () => void;
}
export declare function Scanner({ onScan, onClose }: ScannerProps): import("react").JSX.Element;
export {};
