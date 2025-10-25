"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FileUploadZone;
const react_1 = __importStar(require("react"));
const button_1 = require("@/components/ui/button");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
function FileUploadZone({ files, onFilesChange, fileType, title, description, accept, multiple = false, maxFiles = 10, maxSize = 50, className = "", }) {
    const validateFile = (file) => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            return `File size must be less than ${maxSize}MB`;
        }
        // Check file type based on fileType
        const validTypes = {
            mockups: ["image/png", "image/jpeg", "image/jpg"],
            production: ["application/pdf", "image/png", "image/jpeg"],
            separations: ["image/png", "image/jpeg", "application/pdf"],
            embroidery: ["application/octet-stream"],
        };
        const isValidType = validTypes[fileType]?.includes(file.type) ||
            (fileType === "embroidery" &&
                (file.name.endsWith(".dst") || file.name.endsWith(".emb")));
        if (!isValidType) {
            return `Invalid file type for ${fileType}`;
        }
        return null;
    };
    const handleFileUpload = (0, react_1.useCallback)(async (file) => {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
            react_hot_toast_1.toast.error(validationError);
            return;
        }
        // Check max files limit
        if (files.length >= maxFiles) {
            react_hot_toast_1.toast.error(`Maximum ${maxFiles} files allowed`);
            return;
        }
        const fileUpload = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            url: "",
            uploaded: false,
            uploading: true,
            error: null,
            type: fileType === "mockups"
                ? "mockup"
                : fileType === "production"
                    ? "production"
                    : fileType === "separations"
                        ? "separation"
                        : "embroidery",
        };
        // Add uploading file to list
        const newFiles = [...files, fileUpload];
        onFilesChange(newFiles);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", fileType);
            const response = await fetch("/api/uploads", {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                // Update with successful upload
                const updatedFiles = newFiles.map(f => f.id === fileUpload.id
                    ? { ...f, url: result.url, uploaded: true, uploading: false }
                    : f);
                onFilesChange(updatedFiles);
                react_hot_toast_1.toast.success("File uploaded successfully");
            }
            else {
                throw new Error(result.message || "Upload failed");
            }
        }
        catch (error) {
            // Update with error
            const updatedFiles = newFiles.map(f => f.id === fileUpload.id
                ? {
                    ...f,
                    uploading: false,
                    error: error instanceof Error ? error.message : "Upload failed",
                }
                : f);
            onFilesChange(updatedFiles);
            react_hot_toast_1.toast.error("Failed to upload file");
        }
    }, [files, onFilesChange, fileType, maxFiles, maxSize]);
    const handleDrop = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        droppedFiles.forEach(file => {
            handleFileUpload(file);
        });
    }, [handleFileUpload]);
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        selectedFiles.forEach(file => {
            handleFileUpload(file);
        });
        // Clear input value to allow selecting same file again
        e.target.value = "";
    };
    const removeFile = (fileId) => {
        const updatedFiles = files.filter(f => f.id !== fileId);
        onFilesChange(updatedFiles);
    };
    const retryUpload = (fileId) => {
        const file = files.find(f => f.id === fileId);
        if (file && file.file) {
            const updatedFiles = files.filter(f => f.id !== fileId);
            onFilesChange(updatedFiles);
            handleFileUpload(file.file);
        }
    };
    return (<div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="mb-1 text-sm font-medium">{title}</h4>
        {description && (<p className="mb-3 text-xs text-muted-foreground">{description}</p>)}

        <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-blue-400" onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => document.getElementById(`file-input-${fileType}`)?.click()}>
          <div className="text-center">
            <lucide_react_1.FileImage className="mx-auto mb-2 h-8 w-8 text-gray-500"/>
            <p className="mb-1 text-sm text-gray-600">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxFiles} files, {maxSize}MB each
            </p>
            <input id={`file-input-${fileType}`} type="file" className="hidden" multiple={multiple} accept={accept} onChange={handleFileSelect}/>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (<div className="space-y-2">
          {files.map(fileUpload => (<div key={fileUpload.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <lucide_react_1.File className="h-4 w-4 flex-shrink-0"/>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {fileUpload.file?.name || "Unknown file"}
                  </p>
                  {fileUpload.uploading && (<progress_1.Progress value={50} className="mt-1 h-1"/>)}
                  {fileUpload.error && (<p className="mt-1 text-xs text-red-600">
                      {fileUpload.error}
                    </p>)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {fileUpload.uploading && (<lucide_react_1.Clock className="h-4 w-4 animate-spin text-blue-500"/>)}
                {fileUpload.uploaded && (<lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>)}
                {fileUpload.error && (<div className="flex gap-1">
                    <button_1.Button variant="ghost" size="sm" onClick={() => retryUpload(fileUpload.id)} className="h-6 px-2 py-1 text-xs">
                      Retry
                    </button_1.Button>
                  </div>)}
                <button_1.Button variant="ghost" size="sm" onClick={() => removeFile(fileUpload.id)} className="text-red-500 hover:text-red-700">
                  <lucide_react_1.X className="h-4 w-4"/>
                </button_1.Button>
              </div>
            </div>))}
        </div>)}

      {/* Upload Summary */}
      {files.length > 0 && (<div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {files.filter(f => f.uploaded).length} of {files.length} files
            uploaded
          </span>
          <span>
            {files.length}/{maxFiles} files
          </span>
        </div>)}
    </div>);
}
