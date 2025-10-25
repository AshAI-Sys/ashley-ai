interface ProfilePictureUploadProps {
    currentPicture?: string | null;
    employeeId: string;
    employeeName: string;
    onUploadSuccess?: (url: string) => void;
    onDeleteSuccess?: () => void;
    size?: "sm" | "md" | "lg";
}
export declare function ProfilePictureUpload({ currentPicture, employeeId, employeeName, onUploadSuccess, onDeleteSuccess, size, }: ProfilePictureUploadProps): import("react").JSX.Element;
export {};
