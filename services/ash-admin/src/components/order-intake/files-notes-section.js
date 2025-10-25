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
exports.FilesNotesSection = FilesNotesSection;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const textarea_1 = require("@/components/ui/textarea");
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const progress_1 = require("@/components/ui/progress");
const select_1 = require("@/components/ui/select");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
const FILE_CATEGORIES = [
    { value: "reference", label: "Reference Materials", icon: lucide_react_1.FileImage },
    { value: "specification", label: "Specifications", icon: lucide_react_1.FileText },
    { value: "artwork", label: "Additional Artwork", icon: lucide_react_1.Image },
    { value: "measurements", label: "Size/Measurements", icon: lucide_react_1.FileSpreadsheet },
    { value: "contract", label: "Contracts/Agreements", icon: lucide_react_1.FileText },
    { value: "other", label: "Other Documents", icon: lucide_react_1.File },
];
const ACCEPTED_FILE_TYPES = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ai",
    ".eps",
    ".psd",
    ".txt",
    ".zip",
    ".rar",
];
const INSTRUCTION_TEMPLATES = [
    {
        name: "Color Matching",
        template: "Please ensure exact color matching using Pantone [COLOR CODE]. Sample reference attached.",
    },
    {
        name: "Special Placement",
        template: "Design placement: [X] inches from collar, centered horizontally. Please verify with sample before production.",
    },
    {
        name: "Quality Requirements",
        template: "This order requires premium quality standards. Please use top-grade materials and extra QC attention.",
    },
    {
        name: "Packaging Instructions",
        template: "Individual poly bags required. Include care labels and hang tags as specified in attached documents.",
    },
    {
        name: "Rush Order",
        template: "RUSH ORDER: Please prioritize this order. Client has strict deadline. Coordinate with production manager.",
    },
    {
        name: "Sample Request",
        template: "Please prepare 1-2 samples for client approval before proceeding with full production.",
    },
];
function FilesNotesSection({ uploadedFiles, specialInstructions, onFilesChange, onInstructionsChange, }) {
    const [dragActive, setDragActive] = (0, react_1.useState)(false);
    const [analyzingFiles, setAnalyzingFiles] = (0, react_1.useState)([]);
    const fileInputRef = (0, react_1.useRef)(null);
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
        return file.size <= 100 * 1024 * 1024; // 100MB limit
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return bytes + " B";
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };
    const _getFileIcon = (type, category) => {
        const categoryData = FILE_CATEGORIES.find(c => c.value === category);
        if (categoryData)
            return categoryData.icon;
        if (type.startsWith("image/"))
            return lucide_react_1.Image;
        if (type.includes("pdf"))
            return lucide_react_1.FileText;
        if (type.includes("sheet") || type.includes("excel"))
            return lucide_react_1.FileSpreadsheet;
        return lucide_react_1.File;
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
                react_hot_toast_1.toast.error(`${file.name}: File too large (max 100MB)`);
                continue;
            }
            const preview = await createFilePreview(file);
            const uploadedFile = {
                id: Math.random().toString(36).substring(7),
                file,
                name: file.name,
                size: formatFileSize(file.size),
                type: file.type,
                category: "other",
                preview,
                uploadProgress: 0,
                uploaded: false,
            };
            validFiles.push(uploadedFile);
        }
        if (validFiles.length > 0) {
            const updatedFiles = [...uploadedFiles, ...validFiles];
            onFilesChange(updatedFiles);
            // Start upload simulation
            validFiles.forEach(file => uploadFile(file));
        }
    };
    const uploadFile = async (file) => {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            const updatedFiles = uploadedFiles.map(f => f.id === file.id ? { ...f, uploadProgress: progress } : f);
            onFilesChange(updatedFiles);
        }
        // Mark as uploaded
        const uploadedFiles_ = uploadedFiles.map(f => f.id === file.id ? { ...f, uploaded: true } : f);
        onFilesChange(uploadedFiles_);
        // Start Ashley AI analysis
        analyzeFileWithAshley(file);
    };
    const analyzeFileWithAshley = async (file) => {
        setAnalyzingFiles(prev => [...prev, file.id]);
        try {
            // Simulate Ashley AI file analysis
            await new Promise(resolve => setTimeout(resolve, 3000));
            const mockAnalysis = {
                requirements: [
                    "Color specifications clearly defined",
                    "Size measurements are accurate",
                    "Print placement details provided",
                ].slice(0, Math.floor(Math.random() * 3) + 1),
                suggestions: [
                    "Consider adding bleed area specifications",
                    "Include fabric care instructions",
                    "Specify thread colors for embroidery",
                ].slice(0, Math.floor(Math.random() * 3) + 1),
                warnings: Math.random() > 0.7
                    ? [
                        "File resolution may be too low for printing",
                        "Color profile not optimized for production",
                    ]
                    : [],
                feasible: Math.random() > 0.2, // 80% chance feasible
            };
            const analyzedFiles = uploadedFiles.map(f => f.id === file.id ? { ...f, ashleyAnalysis: mockAnalysis } : f);
            onFilesChange(analyzedFiles);
            if (mockAnalysis.feasible) {
                react_hot_toast_1.toast.success(`Ashley AI: File "${file.name}" analysis complete`);
            }
            else {
                react_hot_toast_1.toast.error(`Ashley AI: Issues found in "${file.name}"`);
            }
        }
        catch (error) {
            console.error("File analysis error:", error);
            react_hot_toast_1.toast.error("Ashley AI file analysis failed");
        }
        finally {
            setAnalyzingFiles(prev => prev.filter(id => id !== file.id));
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
        const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
        onFilesChange(updatedFiles);
    };
    const updateFileCategory = (fileId, category) => {
        const updatedFiles = uploadedFiles.map(f => f.id === fileId ? { ...f, category } : f);
        onFilesChange(updatedFiles);
    };
    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };
    const insertTemplate = (template) => {
        const currentInstructions = specialInstructions || "";
        const newInstructions = currentInstructions
            ? `${currentInstructions}\n\n${template}`
            : template;
        onInstructionsChange(newInstructions);
    };
    const getFilesByCategory = () => {
        const grouped = {};
        uploadedFiles.forEach(file => {
            if (!grouped[file.category]) {
                grouped[file.category] = [];
            }
            grouped[file.category].push(file);
        });
        return grouped;
    };
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          H. Files & Special Instructions
          <badge_1.Badge variant="outline">Optional</badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* File Upload Area */}
        <div>
          <label_1.Label className="mb-3 block">Additional Files</label_1.Label>
          <div className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            <lucide_react_1.Upload className="mx-auto mb-4 h-10 w-10 text-gray-700"/>
            <p className="mb-2 text-lg font-medium">Upload Additional Files</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Drag and drop files here, or click to browse
            </p>
            <button_1.Button onClick={triggerFileSelect} variant="outline">
              <lucide_react_1.FileText className="mr-2 h-4 w-4"/>
              Choose Files
            </button_1.Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Supported: {ACCEPTED_FILE_TYPES.slice(0, 8).join(", ")}, and more
              (Max 100MB each)
            </p>
          </div>

          <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_FILE_TYPES.join(",")} onChange={handleFileInput} className="hidden"/>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (<div>
            <h4 className="mb-4 font-medium">
              Uploaded Files ({uploadedFiles.length})
            </h4>

            {Object.entries(getFilesByCategory()).map(([category, files]) => {
                const categoryData = FILE_CATEGORIES.find(c => c.value === category);
                const IconComponent = categoryData?.icon || lucide_react_1.File;
                return (<div key={category} className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <IconComponent className="h-4 w-4"/>
                    <h5 className="font-medium">
                      {categoryData?.label || "Other"}
                    </h5>
                    <badge_1.Badge variant="outline" className="text-xs">
                      {files.length} file{files.length !== 1 ? "s" : ""}
                    </badge_1.Badge>
                  </div>

                  <div className="space-y-3">
                    {files.map(file => (<div key={file.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-1 items-start gap-3">
                            {file.preview ? (<img src={file.preview} alt={file.name} className="h-16 w-16 rounded border object-cover"/>) : (<div className="flex h-16 w-16 items-center justify-center rounded border bg-gray-100">
                                <lucide_react_1.FileText className="h-6 w-6 text-gray-700"/>
                              </div>)}

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">
                                {file.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {file.size}
                              </p>

                              <div className="mt-2 flex gap-2">
                                <select_1.Select value={file.category} onValueChange={value => updateFileCategory(file.id, value)}>
                                  <select_1.SelectTrigger className="w-40">
                                    <select_1.SelectValue />
                                  </select_1.SelectTrigger>
                                  <select_1.SelectContent>
                                    {FILE_CATEGORIES.map(cat => (<select_1.SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                      </select_1.SelectItem>))}
                                  </select_1.SelectContent>
                                </select_1.Select>
                              </div>

                              {!file.uploaded &&
                            file.uploadProgress !== undefined && (<div className="mt-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Uploading...</span>
                                      <span>{file.uploadProgress}%</span>
                                    </div>
                                    <progress_1.Progress value={file.uploadProgress} className="mt-1"/>
                                  </div>)}

                              {file.uploaded &&
                            analyzingFiles.includes(file.id) && (<div className="mt-2 flex items-center gap-2 text-sm text-purple-600">
                                    <lucide_react_1.Sparkles className="h-4 w-4 animate-pulse"/>
                                    Ashley AI is analyzing...
                                  </div>)}

                              {file.ashleyAnalysis && (<div className="mt-3 space-y-2">
                                  <div className="flex items-center gap-2">
                                    {file.ashleyAnalysis.feasible ? (<lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>) : (<lucide_react_1.AlertCircle className="h-4 w-4 text-red-500"/>)}
                                    <span className={`text-sm font-medium ${file.ashleyAnalysis.feasible
                                ? "text-green-700"
                                : "text-red-700"}`}>
                                      Ashley AI:{" "}
                                      {file.ashleyAnalysis.feasible
                                ? "Analysis Complete"
                                : "Issues Found"}
                                    </span>
                                  </div>

                                  {file.ashleyAnalysis.requirements.length >
                                0 && (<div className="text-sm">
                                      <p className="mb-1 font-medium text-blue-700">
                                        Requirements Identified:
                                      </p>
                                      <ul className="space-y-1">
                                        {file.ashleyAnalysis.requirements.map((req, i) => (<li key={i} className="flex items-start gap-1 text-blue-600">
                                              <lucide_react_1.CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0"/>
                                              {req}
                                            </li>))}
                                      </ul>
                                    </div>)}

                                  {file.ashleyAnalysis.suggestions.length >
                                0 && (<div className="text-sm">
                                      <p className="mb-1 font-medium text-green-700">
                                        Suggestions:
                                      </p>
                                      <ul className="space-y-1">
                                        {file.ashleyAnalysis.suggestions.map((suggestion, i) => (<li key={i} className="flex items-start gap-1 text-green-600">
                                              <span className="mt-1 text-green-400">
                                                •
                                              </span>
                                              {suggestion}
                                            </li>))}
                                      </ul>
                                    </div>)}

                                  {file.ashleyAnalysis.warnings.length > 0 && (<div className="text-sm">
                                      <p className="mb-1 font-medium text-amber-700">
                                        Warnings:
                                      </p>
                                      <ul className="space-y-1">
                                        {file.ashleyAnalysis.warnings.map((warning, i) => (<li key={i} className="flex items-start gap-1 text-amber-600">
                                              <lucide_react_1.AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0"/>
                                              {warning}
                                            </li>))}
                                      </ul>
                                    </div>)}
                                </div>)}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button_1.Button variant="ghost" size="sm" onClick={() => window.open(URL.createObjectURL(file.file), "_blank")} title="Preview file">
                              <lucide_react_1.Eye className="h-4 w-4"/>
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="text-red-500 hover:text-red-700">
                              <lucide_react_1.X className="h-4 w-4"/>
                            </button_1.Button>
                          </div>
                        </div>
                      </div>))}
                  </div>
                </div>);
            })}
          </div>)}

        {/* Special Instructions */}
        <div>
          <label_1.Label htmlFor="special-instructions">Special Instructions</label_1.Label>
          <p className="mb-3 text-sm text-muted-foreground">
            Provide any specific requirements, color matching details, placement
            instructions, or other important notes
          </p>

          {/* Instruction Templates */}
          <div className="mb-3">
            <label_1.Label className="text-sm">Quick Templates</label_1.Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {INSTRUCTION_TEMPLATES.map((template, i) => (<button_1.Button key={i} variant="outline" size="sm" onClick={() => insertTemplate(template.template)} className="text-xs">
                  {template.name}
                </button_1.Button>))}
            </div>
          </div>

          <textarea_1.Textarea id="special-instructions" value={specialInstructions} onChange={e => onInstructionsChange(e.target.value)} placeholder="Enter any special instructions, requirements, or notes for production..." rows={6} className="resize-vertical"/>

          <div className="mt-2 text-xs text-muted-foreground">
            {specialInstructions.length}/2000 characters
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
