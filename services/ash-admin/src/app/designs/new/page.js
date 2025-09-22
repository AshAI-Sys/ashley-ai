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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewDesignPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const select_1 = require("@/components/ui/select");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("next/navigation");
const react_hot_toast_1 = require("react-hot-toast");
function NewDesignPage() {
    const router = (0, navigation_1.useRouter)();
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    const [validating, setValidating] = (0, react_1.useState)(false);
    const [validationResult, setValidationResult] = (0, react_1.useState)(null);
    // Form state
    const [formData, setFormData] = (0, react_1.useState)({
        order_id: '',
        name: '',
        method: '',
        files: {
            mockups: [],
            production: [],
            separations: [],
            embroidery: []
        },
        placements: [{
                id: '1',
                area: 'front',
                width_cm: 20,
                height_cm: 25,
                offset_x: 0,
                offset_y: 5
            }],
        palette: [],
        meta: {
            dpi: 300,
            notes: '',
            color_count: 1
        }
    });
    (0, react_1.useEffect)(() => {
        fetchOrders();
    }, []);
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/orders?include=brand,client&status=INTAKE,DESIGN_PENDING');
            const data = await response.json();
            if (data.success) {
                setOrders(data.data);
            }
        }
        catch (error) {
            console.error('Failed to fetch orders:', error);
            react_hot_toast_1.toast.error('Failed to fetch orders');
        }
        finally {
            setLoading(false);
        }
    };
    const selectedOrder = orders.find(o => o.id === formData.order_id);
    // Auto-populate brand when order is selected
    (0, react_1.useEffect)(() => {
        if (selectedOrder && !formData.name) {
            setFormData(prev => ({
                ...prev,
                name: `${selectedOrder.brand.name} - ${selectedOrder.order_number}`
            }));
        }
    }, [selectedOrder, formData.name]);
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
        setFormData(prev => {
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
                setFormData(prev => {
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
            setFormData(prev => {
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
    // Placement management
    const addPlacement = () => {
        const newId = (formData.placements.length + 1).toString();
        setFormData(prev => ({
            ...prev,
            placements: [...prev.placements, {
                    id: newId,
                    area: 'front',
                    width_cm: 20,
                    height_cm: 25,
                    offset_x: 0,
                    offset_y: 5
                }]
        }));
    };
    const removePlacement = (id) => {
        if (formData.placements.length > 1) {
            setFormData(prev => ({
                ...prev,
                placements: prev.placements.filter(p => p.id !== id)
            }));
        }
    };
    const updatePlacement = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            placements: prev.placements.map(placement => placement.id === id ? { ...placement, [field]: value } : placement)
        }));
    };
    // Color management
    const addColor = () => {
        setFormData(prev => ({
            ...prev,
            palette: [...prev.palette, '#000000']
        }));
    };
    const updateColor = (index, color) => {
        setFormData(prev => ({
            ...prev,
            palette: prev.palette.map((c, i) => i === index ? color : c)
        }));
    };
    const removeColor = (index) => {
        setFormData(prev => ({
            ...prev,
            palette: prev.palette.filter((_, i) => i !== index)
        }));
    };
    // Remove file
    const removeFile = (type, index) => {
        setFormData(prev => ({
            ...prev,
            files: {
                ...prev.files,
                [type]: prev.files[type].filter((_, i) => i !== index)
            }
        }));
    };
    // Ashley AI Validation
    const runAshleyValidation = async () => {
        if (!formData.order_id || !formData.method) {
            react_hot_toast_1.toast.error('Please select order and print method first');
            return;
        }
        setValidating(true);
        try {
            const response = await fetch('/api/ashley/validate-design', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: formData.order_id,
                    method: formData.method,
                    placements: formData.placements,
                    files: formData.files,
                    color_count: formData.meta.color_count
                })
            });
            const result = await response.json();
            setValidationResult(result);
            if (result.status === 'PASS') {
                react_hot_toast_1.toast.success('Design validation passed!');
            }
            else if (result.status === 'WARN') {
                react_hot_toast_1.toast.warning(`Design validation passed with warnings: ${result.issues?.length || 0} issues found`);
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
        if (!formData.order_id) {
            react_hot_toast_1.toast.error('Please select an order');
            return false;
        }
        if (!formData.name.trim()) {
            react_hot_toast_1.toast.error('Please enter a design name');
            return false;
        }
        if (!formData.method) {
            react_hot_toast_1.toast.error('Please select a printing method');
            return false;
        }
        const hasFiles = Object.values(formData.files).some(fileArray => fileArray.length > 0 && fileArray.some(f => f.uploaded));
        if (!hasFiles) {
            react_hot_toast_1.toast.error('Please upload at least one design file');
            return false;
        }
        return true;
    };
    // Form submission
    const handleSubmit = async (isDraft = false) => {
        if (!validateForm())
            return;
        setSubmitting(true);
        try {
            const designData = {
                order_id: formData.order_id,
                name: formData.name,
                method: formData.method,
                files: {
                    mockup_url: formData.files.mockups.find(f => f.uploaded)?.url || '',
                    prod_url: formData.files.production.find(f => f.uploaded)?.url || '',
                    separations: formData.files.separations.filter(f => f.uploaded).map(f => f.url),
                    dst_url: formData.files.embroidery.find(f => f.uploaded)?.url || ''
                },
                placements: formData.placements.map(({ id, ...placement }) => placement),
                palette: formData.palette.length > 0 ? formData.palette : undefined,
                meta: formData.meta,
                status: isDraft ? 'DRAFT' : 'PENDING_APPROVAL'
            };
            const response = await fetch('/api/designs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(designData)
            });
            const result = await response.json();
            if (response.ok) {
                react_hot_toast_1.toast.success(`Design ${isDraft ? 'saved as draft' : 'uploaded successfully'}`);
                router.push(`/designs/${result.asset_id}`);
            }
            else {
                react_hot_toast_1.toast.error(result.message || 'Failed to upload design');
            }
        }
        catch (error) {
            console.error('Submit error:', error);
            react_hot_toast_1.toast.error('Failed to upload design');
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
      
      {formData.files[type].length > 0 && (<div className="mt-3 space-y-2">
          {formData.files[type].map((fileUpload, index) => (<div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
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
    return (<div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Upload New Design</h1>
        <p className="text-muted-foreground">Create a new design asset with comprehensive file management and validation</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Design Information</card_1.CardTitle>
              <card_1.CardDescription>Link this design to a Purchase Order and provide basic details</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div>
                <label_1.Label htmlFor="order">Purchase Order (PO) *</label_1.Label>
                <select_1.Select value={formData.order_id} onValueChange={(value) => setFormData(prev => ({ ...prev, order_id: value }))}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Select purchase order"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {orders.map(order => (<select_1.SelectItem key={order.id} value={order.id}>
                        {order.order_number} - {order.client.name} ({order.brand.name})
                      </select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
                {selectedOrder && (<div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <strong>Brand:</strong> {selectedOrder.brand.name} ({selectedOrder.brand.code})<br />
                    <strong>Client:</strong> {selectedOrder.client.name}
                  </div>)}
              </div>

              <div>
                <label_1.Label htmlFor="name">Design Name *</label_1.Label>
                <input_1.Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Summer Collection Logo v1.0"/>
              </div>

              <div>
                <label_1.Label htmlFor="method">Print Method *</label_1.Label>
                <select_1.Select value={formData.method} onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Select print method"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="SILKSCREEN">Silkscreen</select_1.SelectItem>
                    <select_1.SelectItem value="SUBLIMATION">Sublimation</select_1.SelectItem>
                    <select_1.SelectItem value="DTF">DTF (Direct to Film)</select_1.SelectItem>
                    <select_1.SelectItem value="EMBROIDERY">Embroidery</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label_1.Label>DPI/Resolution</label_1.Label>
                  <input_1.Input type="number" value={formData.meta.dpi} onChange={(e) => setFormData(prev => ({
            ...prev,
            meta: { ...prev.meta, dpi: parseInt(e.target.value) || 300 }
        }))} min="72" max="600"/>
                </div>
                <div>
                  <label_1.Label>Color Count</label_1.Label>
                  <input_1.Input type="number" value={formData.meta.color_count} onChange={(e) => setFormData(prev => ({
            ...prev,
            meta: { ...prev.meta, color_count: parseInt(e.target.value) || 1 }
        }))} min="1" max="12"/>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* File Upload System */}
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <card_1.CardTitle>Design Files</card_1.CardTitle>
                  <card_1.CardDescription>Upload design files with drag & drop support</card_1.CardDescription>
                </div>
                <button_1.Button onClick={runAshleyValidation} disabled={validating || !formData.method} variant="outline" size="sm">
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
              
              {formData.method === 'SILKSCREEN' && (<FileList type="separations" title="Separations (per color)"/>)}
              
              {formData.method === 'EMBROIDERY' && (<FileList type="embroidery" title="Embroidery Files (DST/EMB)"/>)}
              
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

          {/* Design Placements */}
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <card_1.CardTitle>Design Placements</card_1.CardTitle>
                  <card_1.CardDescription>Specify placement areas, sizes, and positions</card_1.CardDescription>
                </div>
                <button_1.Button onClick={addPlacement} size="sm" variant="outline">
                  <lucide_react_1.Plus className="w-4 h-4 mr-1"/>
                  Add Placement
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              {formData.placements.map((placement, index) => (<div key={placement.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Placement {index + 1}</h4>
                    {formData.placements.length > 1 && (<button_1.Button variant="outline" size="sm" onClick={() => removePlacement(placement.id)}>
                        <lucide_react_1.Minus className="w-4 h-4"/>
                      </button_1.Button>)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label_1.Label>Area</label_1.Label>
                      <select_1.Select value={placement.area} onValueChange={(value) => updatePlacement(placement.id, 'area', value)}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="front">Front</select_1.SelectItem>
                          <select_1.SelectItem value="back">Back</select_1.SelectItem>
                          <select_1.SelectItem value="left_chest">Left Chest</select_1.SelectItem>
                          <select_1.SelectItem value="sleeve">Sleeve</select_1.SelectItem>
                          <select_1.SelectItem value="all_over">All Over</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>

                    <div>
                      <label_1.Label>Width (cm)</label_1.Label>
                      <input_1.Input type="number" value={placement.width_cm} onChange={(e) => updatePlacement(placement.id, 'width_cm', parseFloat(e.target.value) || 0)} min="0" step="0.1"/>
                    </div>

                    <div>
                      <label_1.Label>Height (cm)</label_1.Label>
                      <input_1.Input type="number" value={placement.height_cm} onChange={(e) => updatePlacement(placement.id, 'height_cm', parseFloat(e.target.value) || 0)} min="0" step="0.1"/>
                    </div>

                    <div>
                      <label_1.Label>Offset X (cm)</label_1.Label>
                      <input_1.Input type="number" value={placement.offset_x} onChange={(e) => updatePlacement(placement.id, 'offset_x', parseFloat(e.target.value) || 0)} step="0.1"/>
                    </div>

                    <div>
                      <label_1.Label>Offset Y (cm)</label_1.Label>
                      <input_1.Input type="number" value={placement.offset_y} onChange={(e) => updatePlacement(placement.id, 'offset_y', parseFloat(e.target.value) || 0)} step="0.1"/>
                    </div>
                  </div>
                </div>))}
            </card_1.CardContent>
          </card_1.Card>

          {/* Color Management */}
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <card_1.CardTitle>Color Palette</card_1.CardTitle>
                  <card_1.CardDescription>Define color specifications and Pantone codes</card_1.CardDescription>
                </div>
                <button_1.Button onClick={addColor} size="sm" variant="outline">
                  <lucide_react_1.Plus className="w-4 h-4 mr-1"/>
                  Add Color
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.palette.map((color, index) => (<div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <input type="color" value={color} onChange={(e) => updateColor(index, e.target.value)} className="w-8 h-8 border border-gray-300 rounded cursor-pointer"/>
                    <input_1.Input type="text" value={color} onChange={(e) => updateColor(index, e.target.value)} className="flex-1 text-xs" placeholder="#000000"/>
                    <button_1.Button type="button" onClick={() => removeColor(index)} size="sm" variant="ghost">
                      <lucide_react_1.X className="w-4 h-4"/>
                    </button_1.Button>
                  </div>))}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Additional Notes */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Additional Notes</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <textarea_1.Textarea value={formData.meta.notes} onChange={(e) => setFormData(prev => ({
            ...prev,
            meta: { ...prev.meta, notes: e.target.value }
        }))} placeholder="Any special instructions, requirements, or notes about this design..." rows={4}/>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Design Preview */}
          {formData.files.mockups.find(f => f.uploaded) && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Eye className="w-4 h-4"/>
                  Preview
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <img src={formData.files.mockups.find(f => f.uploaded)?.url || ''} alt="Design preview" className="w-full rounded-lg" onError={(e) => {
                e.target.style.display = 'none';
            }}/>
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Actions */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Actions</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3">
              <button_1.Button onClick={() => handleSubmit(true)} variant="outline" className="w-full" disabled={submitting}>
                <lucide_react_1.Save className="w-4 h-4 mr-2"/>
                Save as Draft
              </button_1.Button>
              
              <button_1.Button onClick={() => handleSubmit(false)} className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                <lucide_react_1.Upload className="w-4 h-4 mr-2"/>
                {submitting ? 'Creating Design...' : 'Create Design'}
              </button_1.Button>
              
              <div className="text-xs text-muted-foreground pt-2">
                <p>• Draft: Save for later editing</p>
                <p>• Create: Ready for approval workflow</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Method Guidelines */}
          {formData.method && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Print Method Guidelines</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="text-sm">
                {formData.method === 'SILKSCREEN' && (<div>
                    <p className="font-medium mb-2">Silkscreen Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Provide color separations for each ink</li>
                      <li>Maximum 6 colors recommended</li>
                      <li>Use vector files when possible</li>
                      <li>Consider ink opacity and blending</li>
                      <li>300 DPI minimum resolution</li>
                    </ul>
                  </div>)}
                
                {formData.method === 'SUBLIMATION' && (<div>
                    <p className="font-medium mb-2">Sublimation Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Works best on polyester fabrics</li>
                      <li>Full color designs supported</li>
                      <li>300+ DPI required</li>
                      <li>Colors may appear lighter on fabric</li>
                      <li>CMYK color mode preferred</li>
                    </ul>
                  </div>)}
                
                {formData.method === 'DTF' && (<div>
                    <p className="font-medium mb-2">DTF Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Works on most fabric types</li>
                      <li>PNG with transparent background</li>
                      <li>White ink layer automatically added</li>
                      <li>300 DPI minimum resolution</li>
                      <li>Consider stretch and durability</li>
                    </ul>
                  </div>)}
                
                {formData.method === 'EMBROIDERY' && (<div>
                    <p className="font-medium mb-2">Embroidery Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Digitized file (.dst/.emb) required</li>
                      <li>Stitch count affects cost</li>
                      <li>Limited fine detail capability</li>
                      <li>Thread color chart needed</li>
                      <li>Consider fabric type and weight</li>
                    </ul>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Upload Progress */}
          {Object.values(formData.files).flat().some(f => f.uploading) && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Upload Progress</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  {Object.entries(formData.files).map(([type, files]) => files.filter(f => f.uploading).map((file, index) => (<div key={`${type}-${index}`} className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span>{file.file?.name}</span>
                          <span>Uploading...</span>
                        </div>
                        <progress_1.Progress value={50} className="h-2"/>
                      </div>)))}
                </div>
              </card_1.CardContent>
            </card_1.Card>)}
        </div>
      </div>
    </div>);
}
