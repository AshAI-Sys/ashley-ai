"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilePictureUpload = ProfilePictureUpload;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const image_1 = __importDefault(require("next/image"));
function ProfilePictureUpload({ currentPicture, employeeId, employeeName, onUploadSuccess, onDeleteSuccess, size = "md", }) {
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [deleting, setDeleting] = (0, react_1.useState)(false);
    const [preview, setPreview] = (0, react_1.useState)(currentPicture || null);
    const fileInputRef = (0, react_1.useRef)(null);
    const sizeClasses = {
        sm: "w-16 h-16",
        md: "w-24 h-24",
        lg: "w-32 h-32",
    };
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }
        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        // Upload to server
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch(`/api/hr/employees/${employeeId}/profile-picture`, {
                method: "POST",
                body: formData,
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Upload failed");
            }
            const data = await response.json();
            setPreview(data.profile_picture);
            onUploadSuccess?.(data.profile_picture);
            // Show success message
            alert("Profile picture uploaded successfully!");
        }
        catch (error) {
            console.error("Upload error:", error);
            alert(error instanceof Error
                ? error.message
                : "Failed to upload profile picture");
            setPreview(currentPicture || null);
        }
        finally {
            setUploading(false);
        }
    };
    const handleDelete = async () => {
        if (!confirm("Are you sure you want to remove this profile picture?")) {
            return;
        }
        setDeleting(true);
        try {
            const response = await fetch(`/api/hr/employees/${employeeId}/profile-picture`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Delete failed");
            }
            setPreview(null);
            onDeleteSuccess?.();
            alert("Profile picture removed successfully!");
        }
        catch (error) {
            console.error("Delete error:", error);
            alert(error instanceof Error
                ? error.message
                : "Failed to delete profile picture");
        }
        finally {
            setDeleting(false);
        }
    };
    return (<div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} relative overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100`}>
        {preview ? (<image_1.default src={preview} alt={employeeName} fill className="object-cover"/>) : (<div className="flex h-full w-full items-center justify-center">
            <lucide_react_1.User className="h-1/2 w-1/2 text-gray-500"/>
          </div>)}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100">
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading || deleting} className="text-white">
            <lucide_react_1.Camera className="h-6 w-6"/>
          </button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden"/>

      <div className="flex gap-2">
        <button_1.Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading || deleting}>
          {uploading ? (<>
              <lucide_react_1.Upload className="mr-1 h-3 w-3 animate-spin"/>
              Uploading...
            </>) : (<>
              <lucide_react_1.Upload className="mr-1 h-3 w-3"/>
              Upload
            </>)}
        </button_1.Button>

        {preview && (<button_1.Button type="button" size="sm" variant="outline" onClick={handleDelete} disabled={uploading || deleting}>
            {deleting ? (<>
                <lucide_react_1.X className="mr-1 h-3 w-3 animate-spin"/>
                Removing...
              </>) : (<>
                <lucide_react_1.X className="mr-1 h-3 w-3"/>
                Remove
              </>)}
          </button_1.Button>)}
      </div>

      <p className="text-center text-xs text-gray-500">
        Max 5MB • JPG, PNG, WebP
      </p>
    </div>);
}
