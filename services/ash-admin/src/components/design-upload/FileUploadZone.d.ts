import React from 'react';
export interface FileUpload {
    file: File | null;
    url: string;
    uploaded: boolean;
    uploading: boolean;
    error: string | null;
    type: 'mockup' | 'production' | 'separation' | 'embroidery';
    id?: string;
}
interface FileUploadZoneProps {
    files: FileUpload[];
    onFilesChange: (files: FileUpload[]) => void;
    fileType: 'mockups' | 'production' | 'separations' | 'embroidery';
    title: string;
    description?: string;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number;
    className?: string;
}
export default function FileUploadZone({ files, onFilesChange, fileType, title, description, accept, multiple, maxFiles, maxSize, className }: FileUploadZoneProps): React.JSX.Element;
export {};
