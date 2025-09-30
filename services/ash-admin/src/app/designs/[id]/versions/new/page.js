'use client';
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewVersionPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const react_hot_toast_1 = require("react-hot-toast");
function NewVersionPage() {
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const [design, setDesign] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    const [validating, setValidating] = (0, react_1.useState)(false);
    const [validationResult, setValidationResult] = (0, react_1.useState)(null);
    // Version form data
    const [versionData, setVersionData] = (0, react_1.useState)({
        files: {
            mockups: [],
            production: [],
            separations: [],
            embroidery: []
        },
        changes_description: '',
        notes: ''
    });
    (0, react_1.useEffect)(() => {
        if (params.id) {
            fetchDesign(params.id);
        }
    }, [params.id]);
    const fetchDesign = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/designs/${id}?include=brand,order`);
            const data = await response.json();
            if (data.success) {
                setDesign(data.data);
            }
            else {
                react_hot_toast_1.toast.error('Failed to fetch design details');
                router.push('/designs');
            }
        }
        catch (error) {
            console.error('Failed to fetch design:', error);
            react_hot_toast_1.toast.error('Failed to fetch design details');
            router.push('/designs');
        }
        finally {
            setLoading(false);
        }
    };
    // File upload handling
    const handleFileUpload = (0, react_1.useCallback)(async (file, type, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        const fileUpload = {
            file,
            url: '',
            uploaded: false,
            uploading: true,
            error: null,
            type: type === 'mockups' ? 'mockup' :
                type === 'production' ? 'production' :
                    type === 'separations' ? 'separation' : 'embroidery'
        };
        // Update state to show uploading
        setVersionData(prev => {
            const newFiles = [...prev.files[type]];
            if (index !== undefined) {
                newFiles[index] = fileUpload;
            }
            else {
                newFiles.push(fileUpload);
            }
            return {
                ...prev,
                files: { ...prev.files, [type]: newFiles }
            };
        });
        try {
            const response = await fetch('/api/uploads', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                // Update with successful upload
                setVersionData(prev => {
                    const newFiles = [...prev.files[type]];
                    const targetIndex = index !== undefined ? index : newFiles.length - 1;
                    newFiles[targetIndex] = {
                        ...fileUpload,
                        url: result.url,
                        uploaded: true,
                        uploading: false
                    };
                    return {
                        ...prev,
                        files: { ...prev.files, [type]: newFiles }
                    };
                });
                react_hot_toast_1.toast.success('File uploaded successfully');
            }
            else {
                throw new Error(result.message || 'Upload failed');
            }
        }
        catch (error) {
            // Update with error
            setVersionData(prev => {
                const newFiles = [...prev.files[type]];
                const targetIndex = index !== undefined ? index : newFiles.length - 1;
                newFiles[targetIndex] = {
                    ...fileUpload,
                    uploading: false,
                    error: error instanceof Error ? error.message : 'Upload failed'
                };
                return {
                    ...prev,
                    files: { ...prev.files, [type]: newFiles }
                };
            });
            react_hot_toast_1.toast.error('Failed to upload file');
        }
    }, []);
    // Drag and drop handlers
    const handleDrop = (0, react_1.useCallback)((e, type) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        files.forEach(file => {
            // Validate file type
            const validTypes = {
                mockups: ['image/png', 'image/jpeg', 'image/jpg'],
                production: ['application/pdf', 'image/png', 'image/jpeg'],
                separations: ['image/png', 'image/jpeg', 'application/pdf'],
                embroidery: ['application/octet-stream'] // .dst, .emb files
            };
            if (validTypes[type].includes(file.type) ||
                (type === 'embroidery' && (file.name.endsWith('.dst') || file.name.endsWith('.emb')))) {
                handleFileUpload(file, type);
            }
            else {
                react_hot_toast_1.toast.error(`Invalid file type for ${type}`);
            }
        });
    }, [handleFileUpload]);
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    // Remove file
    const removeFile = (type, index) => {
        setVersionData(prev => ({
            ...prev,
            files: {
                ...prev.files,
                [type]: prev.files[type].filter((_, i) => i !== index)
            }
        }));
    };
    // Ashley AI Validation
    const runAshleyValidation = async () => {
        if (!design)
            return;
        const hasFiles = Object.values(versionData.files).some(fileArray => fileArray.length > 0 && fileArray.some(f => f.uploaded));
        if (!hasFiles) {
            react_hot_toast_1.toast.error('Please upload at least one file first');
            return;
        }
        setValidating(true);
        try {
            // Get current version data to copy placements and other info
            const currentVersionResponse = await fetch(`/api/designs/${design.id}/versions/${design.current_version}`);
            const currentVersionData = await currentVersionResponse.json();
            let placements = [];
            let palette = [];
            if (currentVersionData.success) {
                placements = JSON.parse(currentVersionData.data.placements || '[]');
                palette = currentVersionData.data.palette ? JSON.parse(currentVersionData.data.palette) : [];
            }
            const response = await fetch('/api/ashley/validate-design', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_id: design.id,
                    method: design.method,
                    placements: placements,
                    files: {
                        mockup_url: versionData.files.mockups.find(f => f.uploaded)?.url || '',
                        prod_url: versionData.files.production.find(f => f.uploaded)?.url || '',
                        separations: versionData.files.separations.filter(f => f.uploaded).map(f => f.url),
                        dst_url: versionData.files.embroidery.find(f => f.uploaded)?.url || ''
                    },
                    color_count: palette.length || 1
                })
            });
            const result = await response.json();
            setValidationResult(result);
            if (result.status === 'PASS') {
                react_hot_toast_1.toast.success('Design validation passed!');
            }
            else if (result.status === 'WARN') {
                (0, react_hot_toast_1.toast)(`Design validation passed with warnings: ${result.issues?.length || 0} issues found`, { style: { background: '#f59e0b', color: 'white' } });
            }
            else {
                react_hot_toast_1.toast.error(`Design validation failed: ${result.issues?.length || 0} critical issues found`);
            }
        }
        catch (error) {
            console.error('Validation failed:', error);
            react_hot_toast_1.toast.error('Ashley AI validation failed');
        }
        finally {
            setValidating(false);
        }
    };
    // Form validation
    const validateForm = () => {
        const hasFiles = Object.values(versionData.files).some(fileArray => fileArray.length > 0 && fileArray.some(f => f.uploaded));
        if (!hasFiles) {
            react_hot_toast_1.toast.error('Please upload at least one file');
            return false;
        }
        if (!versionData.changes_description.trim()) {
            react_hot_toast_1.toast.error('Please describe what changed in this version');
            return false;
        }
        return true;
    };
    // Form submission
    const handleSubmit = async () => {
        if (!validateForm() || !design)
            return;
        setSubmitting(true);
        try {
            // Get current version data to copy placements and palette
            const currentVersionResponse = await fetch(`/api/designs/${design.id}/versions/${design.current_version}`);
            const currentVersionData = await currentVersionResponse.json();
            let placements = [];
            let palette = [];
            let meta = { notes: versionData.notes };
            if (currentVersionData.success) {
                placements = JSON.parse(currentVersionData.data.placements || '[]');
                palette = currentVersionData.data.palette ? JSON.parse(currentVersionData.data.palette) : [];
                const currentMeta = currentVersionData.data.meta ? JSON.parse(currentVersionData.data.meta) : {};
                meta = { ...currentMeta, notes: versionData.notes, changes: versionData.changes_description };
            }
            const newVersionData = {
                files: {
                    mockup_url: versionData.files.mockups.find(f => f.uploaded)?.url || '',
                    prod_url: versionData.files.production.find(f => f.uploaded)?.url || '',
                    separations: versionData.files.separations.filter(f => f.uploaded).map(f => f.url),
                    dst_url: versionData.files.embroidery.find(f => f.uploaded)?.url || ''
                },
                placements: placements,
                palette: palette.length > 0 ? palette : undefined,
                meta: meta
            };
            const response = await fetch(`/api/designs/${design.id}/versions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newVersionData)
            });
            const result = await response.json();
            if (response.ok) {
                react_hot_toast_1.toast.success(`Version ${design.current_version + 1} created successfully`);
                router.push(`/designs/${design.id}`);
            }
            else {
                react_hot_toast_1.toast.error(result.message || 'Failed to create new version');
            }
        }
        catch (error) {
            console.error('Submit error:', error);
            react_hot_toast_1.toast.error('Failed to create new version');
        }
        finally {
            setSubmitting(false);
        }
    };
    const DropZone = ({ type, children }) => (<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors" onDrop={(e) => handleDrop(e, type)} onDragOver={handleDragOver}>
      {children}
    </div>);
    const FileList = ({ type, title }) => (<div>
      <label_1.Label className="text-sm font-medium">{title}</label_1.Label>
      <DropZone type={type}>
        <div className="text-center">
          <lucide_react_1.FileImage className="w-8 h-8 mx-auto text-gray-400 mb-2"/>
          <p className="text-sm text-gray-600">Drop files here or click to browse</p>
          <input type="file" className="hidden" multiple={type === 'separations'} accept={type === 'mockups' ? 'image/*' :
            type === 'production' ? 'image/*,.pdf,.ai' :
                type === 'separations' ? 'image/*,.pdf' :
                    '.dst,.emb'} onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach(file => handleFileUpload(file, type));
        }}/>
        </div>
      </DropZone>
      
      {versionData.files[type].length > 0 && (<div className="mt-3 space-y-2">
          {versionData.files[type].map((fileUpload, index) => (<div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <lucide_react_1.File className="w-4 h-4"/>
                <span className="text-sm">
                  {fileUpload.file?.name || 'Unknown file'}
                </span>
                {fileUpload.uploading && <lucide_react_1.Clock className="w-4 h-4 text-blue-500 animate-spin"/>}
                {fileUpload.uploaded && <lucide_react_1.CheckCircle className="w-4 h-4 text-green-500"/>}
                {fileUpload.error && <lucide_react_1.AlertCircle className="w-4 h-4 text-red-500"/>}
              </div>
              <button_1.Button variant="ghost" size="sm" onClick={() => removeFile(type, index)}>
                <lucide_react_1.X className="w-4 h-4"/>
              </button_1.Button>
            </div>))}
        </div>)}
    </div>);
    if (loading) {
        return (<div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>);
    }
    if (!design) {
        return (<div className="container mx-auto py-6">
        <card_1.Card>
          <card_1.CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Design not found</p>
            <link_1.default href="/designs">
              <button_1.Button className="mt-4">Back to Designs</button_1.Button>
            </link_1.default>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <link_1.default href={`/designs/${design.id}/versions`}>
            <button_1.Button variant="ghost" size="sm">
              <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
              Back to Versions
            </button_1.Button>
          </link_1.default>
          <div>
            <h1 className="text-3xl font-bold">Create New Version</h1>
            <p className="text-muted-foreground">
              {design.name} • Version {design.current_version + 1}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Version Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Version Information</card_1.CardTitle>
              <card_1.CardDescription>Describe the changes in this new version</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div>
                <label_1.Label htmlFor="changes">What Changed? *</label_1.Label>
                <textarea_1.Textarea value={versionData.changes_description} onChange={(e) => setVersionData(prev => ({
            ...prev,
            changes_description: e.target.value
        }))} placeholder="e.g., Updated logo colors, adjusted placement sizes, fixed color separations..." rows={3}/>
              </div>

              <div>
                <label_1.Label htmlFor="notes">Additional Notes</label_1.Label>
                <textarea_1.Textarea value={versionData.notes} onChange={(e) => setVersionData(prev => ({
            ...prev,
            notes: e.target.value
        }))} placeholder="Any additional notes about this version..." rows={2}/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* File Upload System */}
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <card_1.CardTitle>Updated Files</card_1.CardTitle>
                  <card_1.CardDescription>Upload new or updated files for this version</card_1.CardDescription>
                </div>
                <button_1.Button onClick={runAshleyValidation} disabled={validating} variant="outline" size="sm">
                  <lucide_react_1.Zap className="w-4 h-4 mr-2"/>
                  {validating ? 'Validating...' : 'Ashley AI Check'}
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FileList type="mockups" title="Mockup Files (PNG/JPG)"/>
                <FileList type="production" title="Production Files (AI/PDF/PNG)"/>
              </div>
              
              {design.method === 'SILKSCREEN' && (<FileList type="separations" title="Color Separations"/>)}
              
              {design.method === 'EMBROIDERY' && (<FileList type="embroidery" title="Embroidery Files (DST/EMB)"/>)}
              
              {validationResult && (<div className={`p-4 rounded-lg ${validationResult.status === 'PASS' ? 'bg-green-50 border border-green-200' :
                validationResult.status === 'WARN' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {validationResult.status === 'PASS' && <lucide_react_1.CheckCircle className="w-5 h-5 text-green-600"/>}
                    {validationResult.status === 'WARN' && <lucide_react_1.AlertCircle className="w-5 h-5 text-yellow-600"/>}
                    {validationResult.status === 'FAIL' && <lucide_react_1.AlertCircle className="w-5 h-5 text-red-600"/>}
                    <h4 className="font-medium">Ashley AI Validation Result</h4>
                  </div>
                  {validationResult.issues && validationResult.issues.length > 0 && (<ul className="text-sm space-y-1">
                      {validationResult.issues.map((issue, index) => (<li key={index}>• {issue.message}</li>))}
                    </ul>)}
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Design Info */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Current Design</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3 text-sm">
              <div>
                <strong>Name:</strong><br />
                {design.name}
              </div>
              <div>
                <strong>Order:</strong><br />
                {design.order.order_number}
              </div>
              <div>
                <strong>Brand:</strong><br />
                {design.brand.name} ({design.brand.code})
              </div>
              <div>
                <strong>Method:</strong><br />
                <badge_1.Badge variant="outline">{design.method}</badge_1.Badge>
              </div>
              <div>
                <strong>Current Version:</strong><br />
                v{design.current_version}
              </div>
              <div>
                <strong>Next Version:</strong><br />
                <badge_1.Badge className="bg-blue-100 text-blue-800">
                  v{design.current_version + 1}
                </badge_1.Badge>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Actions */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Actions</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3">
              <button_1.Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                <lucide_react_1.Upload className="w-4 h-4 mr-2"/>
                {submitting ? 'Creating Version...' : `Create Version ${design.current_version + 1}`}
              </button_1.Button>
              
              <div className="text-xs text-muted-foreground pt-2">
                <p>• This will create version {design.current_version + 1}</p>
                <p>• Placements and colors will be copied from current version</p>
                <p>• You can edit these after creation</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Version Notes */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Version Control Guidelines</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="text-sm space-y-2">
              <p>• Each version is immutable once created</p>
              <p>• Previous versions remain accessible</p>
              <p>• Placements and colors are inherited</p>
              <p>• Ashley AI will validate the new version</p>
              <p>• Client approvals are per-version</p>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    </div>);
}
