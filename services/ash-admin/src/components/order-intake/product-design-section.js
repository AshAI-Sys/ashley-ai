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
exports.ProductDesignSection = ProductDesignSection;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
const GARMENT_TYPES = [
    { value: "t-shirt", label: "T-Shirt", icon: "👕" },
    { value: "polo", label: "Polo Shirt", icon: "👔" },
    { value: "hoodie", label: "Hoodie", icon: "🧥" },
    { value: "jersey", label: "Jersey", icon: "🏃" },
    { value: "uniform", label: "Uniform", icon: "👮" },
    { value: "cap", label: "Cap/Hat", icon: "🧢" },
    { value: "bag", label: "Bag", icon: "🎒" },
    { value: "custom", label: "Custom", icon: "✨" },
];
const PRINTING_METHODS = [
    {
        value: "silkscreen",
        label: "Silkscreen",
        description: "Best for large quantities, solid colors",
        minQty: 50,
    },
    {
        value: "sublimation",
        label: "Sublimation",
        description: "Full-color, polyester garments only",
        minQty: 10,
    },
    {
        value: "dtf",
        label: "DTF (Direct to Film)",
        description: "Any garment color, detailed designs",
        minQty: 1,
    },
    {
        value: "embroidery",
        label: "Embroidery",
        description: "Premium finish, logos and text",
        minQty: 12,
    },
    {
        value: "rubberized",
        label: "Rubberized Print",
        description: "Raised rubber texture, durable finish",
        minQty: 25,
    },
];
const ACCEPTED_FILE_TYPES = [
    ".png",
    ".jpg",
    ".jpeg",
    ".pdf",
    ".ai",
    ".eps",
    ".svg",
    ".psd",
];
function ProductDesignSection({ garmentType, printingMethod, designFiles, onGarmentTypeChange, onPrintingMethodChange, onDesignFilesChange, }) {
    const [dragActive, setDragActive] = (0, react_1.useState)(false);
    const [validatingWithAshley, setValidatingWithAshley] = (0, react_1.useState)(null);
    const fileInputRef = (0, react_1.useRef)(null);
    const selectedPrintingMethod = PRINTING_METHODS.find(m => m.value === printingMethod);
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        }
        else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };
    const validateFileType = (file) => {
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        return ACCEPTED_FILE_TYPES.includes(extension);
    };
    const validateFileSize = (file) => {
        return file.size <= 50 * 1024 * 1024; // 50MB limit
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return bytes + " B";
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };
    const createFilePreview = (file) => {
        return new Promise(resolve => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target?.result);
                reader.onerror = () => resolve(undefined);
                reader.readAsDataURL(file);
            }
            else {
                resolve(undefined);
            }
        });
    };
    const handleFiles = async (files) => {
        const validFiles = [];
        for (const file of Array.from(files)) {
            if (!validateFileType(file)) {
                react_hot_toast_1.toast.error(`${file.name}: Unsupported file type`);
                continue;
            }
            if (!validateFileSize(file)) {
                react_hot_toast_1.toast.error(`${file.name}: File too large (max 50MB)`);
                continue;
            }
            const preview = await createFilePreview(file);
            const designFile = {
                id: Math.random().toString(36).substring(7),
                file,
                name: file.name,
                size: formatFileSize(file.size),
                type: file.type,
                preview,
                uploadProgress: 0,
                uploaded: false,
            };
            validFiles.push(designFile);
        }
        if (validFiles.length > 0) {
            const updatedFiles = [...designFiles, ...validFiles];
            onDesignFilesChange(updatedFiles);
            // Start upload simulation and Ashley validation
            validFiles.forEach(file => uploadFile(file));
        }
    };
    const uploadFile = async (file) => {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            onDesignFilesChange(prevFiles => prevFiles.map(f => f.id === file.id ? { ...f, uploadProgress: progress } : f));
        }
        // Mark as uploaded
        onDesignFilesChange(prevFiles => prevFiles.map(f => (f.id === file.id ? { ...f, uploaded: true } : f)));
        // Start Ashley AI validation
        validateWithAshley(file);
    };
    const validateWithAshley = async (file) => {
        if (!printingMethod || !garmentType) {
            return;
        }
        setValidatingWithAshley(file.id);
        try {
            // Simulate Ashley AI validation
            await new Promise(resolve => setTimeout(resolve, 3000));
            const mockValidation = {
                feasible: Math.random() > 0.2, // 80% chance feasible
                confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
                suggestions: [
                    "Consider using vector format for better quality",
                    "Colors may require adjustment for sublimation",
                    'Add 0.25" bleed area for better results',
                ].slice(0, Math.floor(Math.random() * 3) + 1),
                warnings: Math.random() > 0.7
                    ? ["High detail areas may not print clearly at small sizes"]
                    : [],
            };
            onDesignFilesChange(prevFiles => prevFiles.map(f => f.id === file.id ? { ...f, ashleyValidation: mockValidation } : f));
            if (mockValidation.feasible) {
                react_hot_toast_1.toast.success(`Ashley AI: Design "${file.name}" looks good for ${printingMethod}!`);
            }
            else {
                react_hot_toast_1.toast.error(`Ashley AI: Design "${file.name}" may have issues with ${printingMethod}`);
            }
        }
        catch (error) {
            console.error("Ashley validation error:", error);
            react_hot_toast_1.toast.error("Ashley AI validation failed");
        }
        finally {
            setValidatingWithAshley(null);
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };
    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
        e.target.value = "";
    };
    const removeFile = (fileId) => {
        const updatedFiles = designFiles.filter(f => f.id !== fileId);
        onDesignFilesChange(updatedFiles);
    };
    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };
    return (<card_1.Card className="border-2">
      <card_1.CardHeader className="border-b-2 bg-gradient-to-r from-blue-50 to-cyan-50">
        <card_1.CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            B
          </span>
          <span className="font-bold">Product & Design</span>
          <badge_1.Badge variant="destructive" className="ml-auto">
            Required
          </badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label_1.Label className="text-sm font-semibold">Garment Type *</label_1.Label>
            <select_1.Select value={garmentType} onValueChange={onGarmentTypeChange}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Select garment type"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {GARMENT_TYPES.map(type => (<select_1.SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          <div className="space-y-2">
            <label_1.Label className="text-sm font-semibold">Printing Method *</label_1.Label>
            <select_1.Select value={printingMethod} onValueChange={onPrintingMethodChange}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Select printing method"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {PRINTING_METHODS.map(method => (<select_1.SelectItem key={method.value} value={method.value}>
                    {method.label} - {method.description} (Min: {method.minQty})
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </div>

        {selectedPrintingMethod && (<div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <h4 className="mb-1 font-medium text-blue-900">
              {selectedPrintingMethod.label} Guidelines
            </h4>
            <p className="text-sm text-blue-800">
              {selectedPrintingMethod.description}
            </p>
            <p className="mt-1 text-sm text-blue-700">
              Minimum quantity: {selectedPrintingMethod.minQty} pieces
            </p>
          </div>)}

        <div>
          <label_1.Label>Design Files *</label_1.Label>
          <div className="space-y-3">
            <div className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
              <lucide_react_1.Upload className="mx-auto mb-4 h-10 w-10 text-gray-700"/>
              <p className="mb-2 text-lg font-medium">Upload Design Files</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Drag and drop files here, or click to browse
              </p>
              <button_1.Button onClick={triggerFileSelect} variant="outline">
                <lucide_react_1.FileImage className="mr-2 h-4 w-4"/>
                Choose Files
              </button_1.Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Supported: {ACCEPTED_FILE_TYPES.join(", ")} (Max 50MB each)
              </p>
            </div>

            <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_FILE_TYPES.join(",")} onChange={handleFileInput} className="hidden"/>

            {designFiles.length > 0 && (<div className="space-y-3">
                <h4 className="font-medium">
                  Uploaded Files ({designFiles.length})
                </h4>
                {designFiles.map(file => (<div key={file.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-1 items-start gap-3">
                        {file.preview ? (<img src={file.preview} alt={file.name} className="h-16 w-16 rounded border object-cover"/>) : (<div className="flex h-16 w-16 items-center justify-center rounded border bg-gray-100">
                            <lucide_react_1.FileImage className="h-6 w-6 text-gray-700"/>
                          </div>)}

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {file.size}
                          </p>

                          {!file.uploaded &&
                    file.uploadProgress !== undefined && (<div className="mt-2">
                                <div className="flex justify-between text-sm">
                                  <span>Uploading...</span>
                                  <span>{file.uploadProgress}%</span>
                                </div>
                                <progress_1.Progress value={file.uploadProgress} className="mt-1"/>
                              </div>)}

                          {file.uploaded &&
                    validatingWithAshley === file.id && (<div className="mt-2 flex items-center gap-2 text-sm text-blue-600" suppressHydrationWarning>
                                <lucide_react_1.Loader2 className="h-4 w-4 animate-spin" suppressHydrationWarning/>
                                <lucide_react_1.Sparkles className="h-4 w-4" suppressHydrationWarning/>
                                Ashley AI is validating...
                              </div>)}

                          {file.ashleyValidation && (<div className="mt-3 space-y-2">
                              <div className="flex items-center gap-2">
                                {file.ashleyValidation.feasible ? (<lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>) : (<lucide_react_1.AlertCircle className="h-4 w-4 text-red-500"/>)}
                                <span className={`text-sm font-medium ${file.ashleyValidation.feasible
                        ? "text-green-700"
                        : "text-red-700"}`}>
                                  Ashley AI:{" "}
                                  {file.ashleyValidation.feasible
                        ? "Feasible"
                        : "Issues Found"}
                                </span>
                                <badge_1.Badge variant="outline" className="text-xs">
                                  {file.ashleyValidation.confidence}% confidence
                                </badge_1.Badge>
                              </div>

                              {file.ashleyValidation.suggestions.length > 0 && (<div className="text-sm">
                                  <p className="mb-1 font-medium text-blue-700">
                                    Suggestions:
                                  </p>
                                  <ul className="space-y-1">
                                    {file.ashleyValidation.suggestions.map((suggestion, i) => (<li key={i} className="flex items-start gap-1 text-blue-600">
                                          <span className="mt-1 text-blue-400">
                                            •
                                          </span>
                                          {suggestion}
                                        </li>))}
                                  </ul>
                                </div>)}

                              {file.ashleyValidation.warnings.length > 0 && (<div className="text-sm">
                                  <p className="mb-1 font-medium text-amber-700">
                                    Warnings:
                                  </p>
                                  <ul className="space-y-1">
                                    {file.ashleyValidation.warnings.map((warning, i) => (<li key={i} className="flex items-start gap-1 text-amber-600">
                                          <lucide_react_1.AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0"/>
                                          {warning}
                                        </li>))}
                                  </ul>
                                </div>)}
                            </div>)}
                        </div>
                      </div>

                      <button_1.Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="text-red-500 hover:text-red-700">
                        <lucide_react_1.X className="h-4 w-4"/>
                      </button_1.Button>
                    </div>
                  </div>))}
              </div>)}
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
