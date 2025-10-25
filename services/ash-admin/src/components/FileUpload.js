"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUpload = FileUpload;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
const hydration_safe_icon_1 = __importDefault(require("@/components/hydration-safe-icon"));
function FileUpload({ onUpload, accept = "image/*", maxSizeMB = 10, folder = "ashley-ai", type = "image", multiple = false, existingUrls = [], onRemove, }) {
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [uploadProgress, setUploadProgress] = (0, react_1.useState)(0);
    const [previewUrls, setPreviewUrls] = (0, react_1.useState)(existingUrls);
    const fileInputRef = (0, react_1.useRef)(null);
    const handleFileSelect = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0)
            return;
        const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Check file size
            if (file.size > maxSize) {
                react_hot_toast_1.default.error(`File ${file.name} is too large. Max size is ${maxSizeMB}MB`);
                continue;
            }
            await uploadFile(file);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    const uploadFile = async (file) => {
        setUploading(true);
        setUploadProgress(0);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", folder);
            formData.append("type", type);
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Upload failed");
            }
            setUploadProgress(100);
            react_hot_toast_1.default.success("File uploaded successfully!");
            // Add to previews
            setPreviewUrls(prev => [...prev, data.url]);
            // Call onUpload callback
            onUpload(data.url, data.public_id);
        }
        catch (error) {
            console.error("Upload error:", error);
            react_hot_toast_1.default.error(error.message || "Failed to upload file");
        }
        finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };
    const handleRemove = (url) => {
        setPreviewUrls(prev => prev.filter(u => u !== url));
        if (onRemove) {
            onRemove(url);
        }
    };
    return (<div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept={accept} multiple={multiple} onChange={handleFileSelect} className="hidden"/>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
          {uploading ? (<>
              <hydration_safe_icon_1.default Icon={lucide_react_1.Loader2} className="h-4 w-4 animate-spin"/>
              Uploading... {uploadProgress}%
            </>) : (<>
              <hydration_safe_icon_1.default Icon={lucide_react_1.Upload} className="h-4 w-4"/>
              Upload {type === "image" ? "Photo" : "File"}
            </>)}
        </button>
        <p className="text-sm text-gray-500">Max size: {maxSizeMB}MB</p>
      </div>

      {/* Preview Grid */}
      {previewUrls.length > 0 && (<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {previewUrls.map((url, index) => (<div key={index} className="group relative">
              {type === "image" ? (<img src={url} alt={`Upload ${index + 1}`} className="h-32 w-full rounded-lg border border-gray-200 object-cover"/>) : (<div className="flex h-32 w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-100">
                  <hydration_safe_icon_1.default Icon={lucide_react_1.File} className="h-8 w-8 text-gray-500"/>
                </div>)}
              <button type="button" onClick={() => handleRemove(url)} className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <hydration_safe_icon_1.default Icon={lucide_react_1.X} className="h-4 w-4"/>
              </button>
            </div>))}
        </div>)}
    </div>);
}
