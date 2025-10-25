import React from "react";
interface DesignFile {
    id: string;
    file: File;
    name: string;
    size: string;
    type: string;
    preview?: string;
    uploadProgress?: number;
    uploaded?: boolean;
    ashleyValidation?: {
        feasible: boolean;
        confidence: number;
        suggestions: string[];
        warnings: string[];
    };
}
interface ProductDesignSectionProps {
    garmentType: string;
    printingMethod: string;
    designFiles: DesignFile[];
    onGarmentTypeChange: (type: string) => void;
    onPrintingMethodChange: (method: string) => void;
    onDesignFilesChange: (files: DesignFile[] | ((prevFiles: DesignFile[]) => DesignFile[])) => void;
}
export declare function ProductDesignSection({ garmentType, printingMethod, designFiles, onGarmentTypeChange, onPrintingMethodChange, onDesignFilesChange, }: ProductDesignSectionProps): React.JSX.Element;
export {};
