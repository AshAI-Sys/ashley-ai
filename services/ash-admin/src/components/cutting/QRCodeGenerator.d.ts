import React from "react";
interface QRCodeGeneratorProps {
    bundleData: {
        orderId: string;
        layId: string;
        sizeCode: string;
        bundleNumber: number;
        qty: number;
    };
    showActions?: boolean;
}
export default function QRCodeGenerator({ bundleData, showActions, }: QRCodeGeneratorProps): React.JSX.Element;
export {};
