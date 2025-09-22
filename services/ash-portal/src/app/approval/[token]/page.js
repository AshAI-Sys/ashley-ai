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
exports.default = ClientApprovalPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@ash-ai/ui/card");
const button_1 = require("@ash-ai/ui/button");
const badge_1 = require("@ash-ai/ui/badge");
const separator_1 = require("@ash-ai/ui/separator");
const textarea_1 = require("@ash-ai/ui/textarea");
const input_1 = require("@ash-ai/ui/input");
const label_1 = require("@ash-ai/ui/label");
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("next/navigation");
const react_hot_toast_1 = require("react-hot-toast");
function ClientApprovalPage() {
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const [approvalData, setApprovalData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    const [decision, setDecision] = (0, react_1.useState)('');
    const [feedback, setFeedback] = (0, react_1.useState)('');
    const [approverName, setApproverName] = (0, react_1.useState)('');
    const [mockupZoom, setMockupZoom] = (0, react_1.useState)(100);
    const [selectedVariant, setSelectedVariant] = (0, react_1.useState)(0);
    const [attachments, setAttachments] = (0, react_1.useState)([]);
    const [imageError, setImageError] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (params.token) {
            fetchApprovalData(params.token);
        }
    }, [params.token]);
    const fetchApprovalData = async (token) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/portal/approval/${token}`);
            const data = await response.json();
            if (data.success) {
                setApprovalData(data.data);
                // Pre-fill client name if available
                if (data.data.client.name) {
                    setApproverName(data.data.client.name);
                }
            }
            else {
                react_hot_toast_1.toast.error(data.message || 'Failed to load approval request');
                router.push('/error');
            }
        }
        catch (error) {
            console.error('Failed to fetch approval data:', error);
            react_hot_toast_1.toast.error('Failed to load approval request');
            router.push('/error');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSubmitDecision = async () => {
        if (!approvalData || !decision) {
            react_hot_toast_1.toast.error('Please select approve or request changes');
            return;
        }
        if (decision === 'changes_requested' && !feedback.trim()) {
            react_hot_toast_1.toast.error('Please provide feedback for requested changes');
            return;
        }
        if (!approverName.trim()) {
            react_hot_toast_1.toast.error('Please provide your name');
            return;
        }
        try {
            setSubmitting(true);
            // Create form data for file upload if there are attachments
            const formData = new FormData();
            formData.append('decision', decision);
            formData.append('feedback', feedback);
            formData.append('approver_name', approverName);
            attachments.forEach((file, index) => {
                formData.append(`attachment_${index}`, file);
            });
            const response = await fetch(`/api/portal/approval/${params.token}/submit`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                react_hot_toast_1.toast.success(decision === 'approved'
                    ? 'Design approved successfully!'
                    : 'Feedback submitted successfully!');
                // Refresh the page to show updated status
                await fetchApprovalData(params.token);
            }
            else {
                react_hot_toast_1.toast.error(result.message || 'Failed to submit decision');
            }
        }
        catch (error) {
            console.error('Failed to submit decision:', error);
            react_hot_toast_1.toast.error('Failed to submit decision');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleFileChange = (event) => {
        const files = event.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setAttachments(prev => [...prev, ...newFiles]);
        }
    };
    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };
    const getStatusColor = (status) => {
        switch (status.toUpperCase()) {
            case 'SENT': return 'bg-blue-100 text-blue-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'CHANGES_REQUESTED': return 'bg-yellow-100 text-yellow-800';
            case 'EXPIRED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getMethodColor = (method) => {
        switch (method.toUpperCase()) {
            case 'SILKSCREEN': return 'bg-purple-100 text-purple-800';
            case 'SUBLIMATION': return 'bg-cyan-100 text-cyan-800';
            case 'DTF': return 'bg-orange-100 text-orange-800';
            case 'EMBROIDERY': return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    if (loading) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approval request...</p>
        </div>
      </div>);
    }
    if (!approvalData) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <card_1.Card className="w-full max-w-md">
          <card_1.CardContent className="py-12 text-center">
            <lucide_react_1.AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
            <h2 className="text-xl font-semibold mb-2">Approval Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This approval link is invalid or has expired.
            </p>
            <button_1.Button onClick={() => window.close()}>Close</button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    const files = JSON.parse(approvalData.design_version.files);
    const placements = JSON.parse(approvalData.design_version.placements);
    const palette = approvalData.design_version.palette ? JSON.parse(approvalData.design_version.palette) : [];
    const isExpired = new Date(approvalData.expires_at) < new Date();
    const isCompleted = approvalData.status !== 'SENT';
    return (<div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Design Approval</h1>
              <p className="text-gray-600 mt-1">
                {approvalData.design_asset.name} • {approvalData.design_asset.order.order_number}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <badge_1.Badge className={getStatusColor(approvalData.status)}>
                {approvalData.status.replace('_', ' ')}
              </badge_1.Badge>
              <badge_1.Badge className={getMethodColor(approvalData.design_asset.method)}>
                {approvalData.design_asset.method}
              </badge_1.Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Expiry Warning */}
        {isExpired && (<card_1.Card className="mb-6 border-red-200 bg-red-50">
            <card_1.CardContent className="py-4">
              <div className="flex items-center gap-3">
                <lucide_react_1.AlertCircle className="w-5 h-5 text-red-600"/>
                <div>
                  <p className="font-medium text-red-800">This approval request has expired</p>
                  <p className="text-sm text-red-600">
                    Expired on {new Date(approvalData.expires_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>)}

        {/* Completion Status */}
        {isCompleted && (<card_1.Card className="mb-6 border-green-200 bg-green-50">
            <card_1.CardContent className="py-4">
              <div className="flex items-center gap-3">
                {approvalData.status === 'APPROVED' ? (<lucide_react_1.CheckCircle className="w-5 h-5 text-green-600"/>) : (<lucide_react_1.MessageCircle className="w-5 h-5 text-yellow-600"/>)}
                <div>
                  <p className="font-medium text-green-800">
                    {approvalData.status === 'APPROVED'
                ? 'Thank you! This design has been approved.'
                : 'Thank you for your feedback! Changes have been requested.'}
                  </p>
                  <p className="text-sm text-green-600">
                    Submitted on {new Date(approvalData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>)}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Design Preview */}
            <card_1.Card>
              <card_1.CardHeader>
                <div className="flex items-center justify-between">
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Image className="w-5 h-5"/>
                    Design Mockup
                  </card_1.CardTitle>
                  <div className="flex items-center gap-2">
                    <button_1.Button size="sm" variant="outline" onClick={() => setMockupZoom(Math.max(50, mockupZoom - 25))} disabled={mockupZoom <= 50}>
                      <lucide_react_1.ZoomOut className="w-4 h-4"/>
                    </button_1.Button>
                    <span className="text-sm font-mono px-2">{mockupZoom}%</span>
                    <button_1.Button size="sm" variant="outline" onClick={() => setMockupZoom(Math.min(200, mockupZoom + 25))} disabled={mockupZoom >= 200}>
                      <lucide_react_1.ZoomIn className="w-4 h-4"/>
                    </button_1.Button>
                  </div>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                {files.mockup_url && !imageError ? (<div className="text-center">
                    <img src={files.mockup_url} alt="Design mockup" className="max-w-full h-auto mx-auto rounded-lg shadow-lg transition-transform duration-200" style={{
                transform: `scale(${mockupZoom / 100})`,
                transformOrigin: 'center top'
            }} onError={() => setImageError(true)}/>
                    <div className="mt-4 flex justify-center gap-2">
                      <button_1.Button size="sm" variant="outline" asChild>
                        <a href={files.mockup_url} target="_blank" rel="noopener noreferrer">
                          <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                          View Full Size
                        </a>
                      </button_1.Button>
                      <button_1.Button size="sm" variant="outline" asChild>
                        <a href={files.mockup_url} download>
                          <lucide_react_1.Download className="w-4 h-4 mr-1"/>
                          Download
                        </a>
                      </button_1.Button>
                    </div>
                  </div>) : (<div className="text-center py-12">
                    <lucide_react_1.Image className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                    <p className="text-gray-500">Design preview not available</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>

            {/* Design Details */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Placements */}
              {placements.length > 0 && (<card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-lg">Design Placements</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-3">
                      {placements.map((placement, index) => (<div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">
                              {placement.area.replace('_', ' ')}
                            </h4>
                            <span className="text-sm text-gray-600">
                              {placement.width_cm} × {placement.height_cm} cm
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Position: X {placement.offset_x}cm, Y {placement.offset_y}cm
                          </div>
                        </div>))}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>)}

              {/* Color Palette */}
              {palette.length > 0 && (<card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-lg flex items-center gap-2">
                      <lucide_react_1.Palette className="w-5 h-5"/>
                      Colors Used
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {palette.map((color, index) => (<div key={index} className="flex items-center gap-2">
                          <div className="w-8 h-8 border border-gray-300 rounded flex-shrink-0" style={{ backgroundColor: color }}/>
                          <span className="text-sm font-mono">{color}</span>
                        </div>))}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>)}
            </div>

            {/* Decision Form */}
            {!isCompleted && !isExpired && (<card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-xl">Your Decision</card_1.CardTitle>
                  <card_1.CardDescription>
                    Please review the design carefully and provide your approval or feedback.
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-6">
                  {/* Approver Name */}
                  <div>
                    <label_1.Label htmlFor="approver_name">Your Name *</label_1.Label>
                    <input_1.Input id="approver_name" value={approverName} onChange={(e) => setApproverName(e.target.value)} placeholder="Enter your full name"/>
                  </div>

                  {/* Decision Buttons */}
                  <div className="space-y-3">
                    <label_1.Label>Your Decision *</label_1.Label>
                    <div className="flex gap-3">
                      <button_1.Button size="lg" variant={decision === 'approved' ? 'default' : 'outline'} className={`flex-1 ${decision === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}`} onClick={() => setDecision('approved')}>
                        <lucide_react_1.ThumbsUp className="w-5 h-5 mr-2"/>
                        Approve Design
                      </button_1.Button>
                      <button_1.Button size="lg" variant={decision === 'changes_requested' ? 'default' : 'outline'} className={`flex-1 ${decision === 'changes_requested' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`} onClick={() => setDecision('changes_requested')}>
                        <lucide_react_1.ThumbsDown className="w-5 h-5 mr-2"/>
                        Request Changes
                      </button_1.Button>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label_1.Label htmlFor="feedback">
                      {decision === 'changes_requested' ? 'What changes would you like? *' : 'Additional Comments (Optional)'}
                    </label_1.Label>
                    <textarea_1.Textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={decision === 'changes_requested'
                ? "Please be specific about what changes you'd like to see..."
                : "Any additional comments or notes..."} rows={4} className={decision === 'changes_requested' ? 'border-yellow-300' : ''}/>
                  </div>

                  {/* File Attachments */}
                  <div>
                    <label_1.Label>Attachments (Optional)</label_1.Label>
                    <div className="space-y-3">
                      <div>
                        <input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFileChange} className="hidden" id="file-upload"/>
                        <button_1.Button variant="outline" asChild>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <lucide_react_1.Paperclip className="w-4 h-4 mr-2"/>
                            Add Files
                          </label>
                        </button_1.Button>
                      </div>
                      
                      {attachments.length > 0 && (<div className="space-y-2">
                          {attachments.map((file, index) => (<div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <lucide_react_1.FileText className="w-4 h-4 text-gray-500"/>
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-gray-500">
                                  ({formatFileSize(file.size)})
                                </span>
                              </div>
                              <button_1.Button size="sm" variant="ghost" onClick={() => removeAttachment(index)}>
                                <lucide_react_1.XCircle className="w-4 h-4 text-red-500"/>
                              </button_1.Button>
                            </div>))}
                        </div>)}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button_1.Button size="lg" onClick={handleSubmitDecision} disabled={submitting || !decision || !approverName.trim() || (decision === 'changes_requested' && !feedback.trim())} className="w-full">
                    <lucide_react_1.Send className="w-5 h-5 mr-2"/>
                    {submitting
                ? 'Submitting...'
                : decision === 'approved'
                    ? 'Submit Approval'
                    : 'Submit Feedback'}
                  </button_1.Button>
                </card_1.CardContent>
              </card_1.Card>)}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Information */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Order Details</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-3 text-sm">
                <div>
                  <strong>Order Number:</strong><br />
                  {approvalData.design_asset.order.order_number}
                </div>
                <separator_1.Separator />
                <div>
                  <strong>Client:</strong><br />
                  {approvalData.design_asset.order.client.name}
                </div>
                <separator_1.Separator />
                <div>
                  <strong>Brand:</strong><br />
                  {approvalData.design_asset.brand.name}
                </div>
                <separator_1.Separator />
                <div>
                  <strong>Print Method:</strong><br />
                  <badge_1.Badge className={getMethodColor(approvalData.design_asset.method)} variant="outline">
                    {approvalData.design_asset.method}
                  </badge_1.Badge>
                </div>
                <separator_1.Separator />
                <div>
                  <strong>Design Version:</strong><br />
                  v{approvalData.version}
                </div>
                <separator_1.Separator />
                <div>
                  <strong>Approval Sent:</strong><br />
                  {new Date(approvalData.created_at).toLocaleDateString()}
                </div>
                {approvalData.expires_at && (<>
                    <div>
                      <strong>Expires:</strong><br />
                      <span className={isExpired ? 'text-red-600' : 'text-gray-900'}>
                        {new Date(approvalData.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </>)}
              </card_1.CardContent>
            </card_1.Card>

            {/* Help & Support */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Need Help?</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="text-sm">
                <p className="mb-3">
                  If you have questions about this design or need clarification, please contact us:
                </p>
                <div className="space-y-2">
                  <p><strong>Email:</strong> support@ashleyai.com</p>
                  <p><strong>Phone:</strong> +63 123 456 7890</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Quality Assurance */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Star className="w-5 h-5 text-yellow-500"/>
                  Quality Promise
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="text-sm">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <lucide_react_1.CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"/>
                    <span>AI-validated print quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <lucide_react_1.CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"/>
                    <span>Color accuracy guaranteed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <lucide_react_1.CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"/>
                    <span>Professional production standards</span>
                  </li>
                </ul>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </div>
      </div>
    </div>);
}
