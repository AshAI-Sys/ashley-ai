import React from "react";
interface UploadedFile {
    id: string;
    file: File;
    name: string;
    size: string;
    type: string;
    category: string;
    preview?: string;
    uploadProgress?: number;
    uploaded?: boolean;
    ashleyAnalysis?: {
        requirements: string[];
        suggestions: string[];
        warnings: string[];
        feasible: boolean;
    };
}
interface FilesNotesSectionProps {
    uploadedFiles: UploadedFile[];
    specialInstructions: string;
    onFilesChange: (files: UploadedFile[]) => void;
    onInstructionsChange: (instructions: string) => void;
}
export declare function FilesNotesSection({ uploadedFiles, specialInstructions, onFilesChange, onInstructionsChange, }: FilesNotesSectionProps): React.JSX.Element;
export {};
