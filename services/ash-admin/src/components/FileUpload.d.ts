interface FileUploadProps {
    onUpload: (url: string, publicId: string) => void;
    accept?: string;
    maxSizeMB?: number;
    folder?: string;
    type?: "image" | "document" | "video";
    multiple?: boolean;
    existingUrls?: string[];
    onRemove?: (url: string) => void;
}
export declare function FileUpload({ onUpload, accept, maxSizeMB, folder, type, multiple, existingUrls, onRemove, }: FileUploadProps): import("react").JSX.Element;
export {};
