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
exports.default = DesignApprovalPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const separator_1 = require("@/components/ui/separator");
const textarea_1 = require("@/components/ui/textarea");
const select_1 = require("@/components/ui/select");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const react_hot_toast_1 = require("react-hot-toast");
const MESSAGE_TEMPLATES = [
    {
        id: 'initial_approval',
        name: 'Initial Design Approval',
        subject: 'Please Review Your Design - {{design_name}}',
        content: `Hi {{client_name}},

Your design "{{design_name}}" is ready for your review and approval.

Please click the link below to view the mockup and provide your feedback:
{{approval_link}}

If you have any questions, please don't hesitate to reach out.

Best regards,
Ashley AI Team`
    },
    {
        id: 'revision_request',
        name: 'Design Revision Request',
        subject: 'Updated Design Ready for Review - {{design_name}}',
        content: `Hi {{client_name}},

We've updated your design "{{design_name}}" based on your feedback.

Please review the new version and let us know if this meets your requirements:
{{approval_link}}

Thank you for your patience.

Best regards,
Ashley AI Team`
    },
    {
        id: 'urgent_approval',
        name: 'Urgent Approval Needed',
        subject: 'URGENT: Design Approval Required - {{design_name}}',
        content: `Hi {{client_name}},

We need your urgent approval for "{{design_name}}" to meet your production deadline.

Please review and approve as soon as possible:
{{approval_link}}

Production is scheduled to begin soon, so please respond at your earliest convenience.

Best regards,
Ashley AI Team`
    },
    {
        id: 'reminder',
        name: 'Approval Reminder',
        subject: 'Reminder: Design Approval Pending - {{design_name}}',
        content: `Hi {{client_name}},

This is a friendly reminder that your design "{{design_name}}" is still pending your approval.

Please take a moment to review:
{{approval_link}}

If you need any changes or have questions, please let us know.

Best regards,
Ashley AI Team`
    }
];
function DesignApprovalPage() {
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const [design, setDesign] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    const [selectedTemplate, setSelectedTemplate] = (0, react_1.useState)('');
    const [customMessage, setCustomMessage] = (0, react_1.useState)('');
    const [emailSubject, setEmailSubject] = (0, react_1.useState)('');
    const [expiryDays, setExpiryDays] = (0, react_1.useState)('7');
    const [selectedVersion, setSelectedVersion] = (0, react_1.useState)(0);
    const [approvalHistory, setApprovalHistory] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (params.id) {
            fetchDesign(params.id);
            fetchApprovalHistory(params.id);
        }
    }, [params.id]);
    const fetchDesign = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/designs/${id}?include=order,brand,versions,approvals,checks`);
            const data = await response.json();
            if (data.success) {
                setDesign(data.data);
                setSelectedVersion(data.data.current_version);
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
    const fetchApprovalHistory = async (id) => {
        try {
            const response = await fetch(`/api/designs/${id}/approval-history`);
            const data = await response.json();
            if (data.success) {
                setApprovalHistory(data.data);
            }
        }
        catch (error) {
            console.error('Failed to fetch approval history:', error);
        }
    };
    const handleTemplateChange = (templateId) => {
        setSelectedTemplate(templateId);
        const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);
        if (template && design) {
            const subject = template.subject
                .replace('{{design_name}}', design.name)
                .replace('{{client_name}}', design.order.client.name);
            const content = template.content
                .replace('{{design_name}}', design.name)
                .replace('{{client_name}}', design.order.client.name)
                .replace('{{approval_link}}', '[Link will be generated]');
            setEmailSubject(subject);
            setCustomMessage(content);
        }
    };
    const handleSendForApproval = async () => {
        if (!design)
            return;
        if (!emailSubject.trim() || !customMessage.trim()) {
            react_hot_toast_1.toast.error('Please provide both subject and message');
            return;
        }
        try {
            setSubmitting(true);
            const response = await fetch(`/api/designs/${design.id}/send-approval`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    version: selectedVersion,
                    email_subject: emailSubject,
                    message: customMessage,
                    expiry_days: parseInt(expiryDays),
                    template_id: selectedTemplate
                })
            });
            const result = await response.json();
            if (response.ok) {
                react_hot_toast_1.toast.success('Design sent for client approval');
                fetchDesign(design.id);
                fetchApprovalHistory(design.id);
                // Reset form
                setSelectedTemplate('');
                setCustomMessage('');
                setEmailSubject('');
            }
            else {
                react_hot_toast_1.toast.error(result.message || 'Failed to send approval');
            }
        }
        catch (error) {
            console.error('Failed to send approval:', error);
            react_hot_toast_1.toast.error('Failed to send approval');
        }
        finally {
            setSubmitting(false);
        }
    };
    const copyApprovalLink = async (token) => {
        const portalUrl = process.env.NODE_ENV === 'production'
            ? 'https://portal.ashleyai.com'
            : 'http://localhost:3003';
        const approvalLink = `${portalUrl}/approval/${token}`;
        try {
            await navigator.clipboard.writeText(approvalLink);
            react_hot_toast_1.toast.success('Approval link copied to clipboard');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to copy link');
        }
    };
    const openApprovalLink = (token) => {
        const portalUrl = process.env.NODE_ENV === 'production'
            ? 'https://portal.ashleyai.com'
            : 'http://localhost:3003';
        const approvalLink = `${portalUrl}/approval/${token}`;
        window.open(approvalLink, '_blank');
    };
    const getStatusColor = (status) => {
        if (!status)
            return 'bg-gray-100 text-gray-800';
        switch (status.toUpperCase()) {
            case 'SENT': return 'bg-blue-100 text-blue-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'CHANGES_REQUESTED': return 'bg-yellow-100 text-yellow-800';
            case 'EXPIRED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getStatusIcon = (status) => {
        if (!status)
            return <lucide_react_1.Clock className="w-4 h-4"/>;
        switch (status.toUpperCase()) {
            case 'SENT': return <lucide_react_1.Clock className="w-4 h-4"/>;
            case 'APPROVED': return <lucide_react_1.CheckCircle className="w-4 h-4"/>;
            case 'CHANGES_REQUESTED': return <lucide_react_1.MessageCircle className="w-4 h-4"/>;
            case 'EXPIRED': return <lucide_react_1.AlertCircle className="w-4 h-4"/>;
            default: return <lucide_react_1.Clock className="w-4 h-4"/>;
        }
    };
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
    const currentVersion = design.versions.find(v => v.version === selectedVersion);
    const files = currentVersion ? JSON.parse(currentVersion.files) : {};
    const activeApproval = design.approvals.find(a => a.status === 'SENT');
    return (<div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <link_1.default href={`/designs/${design.id}`}>
            <button_1.Button variant="ghost" size="sm">
              <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
              Back to Design
            </button_1.Button>
          </link_1.default>
          <div>
            <h1 className="text-3xl font-bold">Client Approval Management</h1>
            <p className="text-muted-foreground">
              {design.name} • {design.order.order_number} • {design.brand.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <badge_1.Badge className={getStatusColor(design.status)}>
            {design.status.replace('_', ' ')}
          </badge_1.Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Send New Approval */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Send className="w-5 h-5"/>
                Send for Client Approval
              </card_1.CardTitle>
              <card_1.CardDescription>
                Create and send a new approval request to the client
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              {/* Client Information */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <lucide_react_1.Users className="w-4 h-4 text-gray-600"/>
                  <span className="font-medium">Client Information</span>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Client:</strong> {design.order.client.name}</p>
                  <p><strong>Contact:</strong> {design.order.client.contact_person}</p>
                  <p><strong>Email:</strong> {design.order.client.email}</p>
                </div>
              </div>

              {/* Version Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label_1.Label htmlFor="version">Version to Send</label_1.Label>
                  <select_1.Select value={selectedVersion.toString()} onValueChange={(value) => setSelectedVersion(parseInt(value))}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Select version"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {design.versions
            .sort((a, b) => b.version - a.version)
            .map(version => (<select_1.SelectItem key={version.id} value={version.version.toString()}>
                            Version {version.version} 
                            {version.version === design.current_version && ' (Current)'}
                          </select_1.SelectItem>))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
                
                <div>
                  <label_1.Label htmlFor="expiry">Expires In (Days)</label_1.Label>
                  <select_1.Select value={expiryDays} onValueChange={setExpiryDays}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Select expiry"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="1">1 Day</select_1.SelectItem>
                      <select_1.SelectItem value="3">3 Days</select_1.SelectItem>
                      <select_1.SelectItem value="7">7 Days</select_1.SelectItem>
                      <select_1.SelectItem value="14">14 Days</select_1.SelectItem>
                      <select_1.SelectItem value="30">30 Days</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              {/* Message Templates */}
              <div>
                <label_1.Label htmlFor="template">Message Template</label_1.Label>
                <select_1.Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Choose a template or write custom message"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {MESSAGE_TEMPLATES.map(template => (<select_1.SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              {/* Email Subject */}
              <div>
                <label_1.Label htmlFor="subject">Email Subject</label_1.Label>
                <input_1.Input id="subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Enter email subject..."/>
              </div>

              {/* Custom Message */}
              <div>
                <label_1.Label htmlFor="message">Message Content</label_1.Label>
                <textarea_1.Textarea id="message" value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Enter your message to the client..." rows={8} className="resize-none"/>
              </div>

              <button_1.Button onClick={handleSendForApproval} disabled={submitting || !emailSubject.trim() || !customMessage.trim()} className="w-full">
                <lucide_react_1.Send className="w-4 h-4 mr-2"/>
                {submitting ? 'Sending...' : 'Send for Approval'}
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>

          {/* Active Approval */}
          {activeApproval && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Clock className="w-5 h-5 text-blue-600"/>
                  Active Approval Request
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(activeApproval.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <badge_1.Badge className={getStatusColor(activeApproval.status)}>
                          {activeApproval.status.replace('_', ' ')}
                        </badge_1.Badge>
                        <span className="font-medium">Version {activeApproval.version}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sent: {new Date(activeApproval.created_at).toLocaleDateString()}
                        {activeApproval.expires_at && (<>
                            {' • '}
                            Expires: {new Date(activeApproval.expires_at).toLocaleDateString()}
                          </>)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button_1.Button size="sm" variant="outline" onClick={() => copyApprovalLink(activeApproval.portal_token)}>
                      <lucide_react_1.Copy className="w-4 h-4 mr-1"/>
                      Copy Link
                    </button_1.Button>
                    <button_1.Button size="sm" variant="outline" onClick={() => openApprovalLink(activeApproval.portal_token)}>
                      <lucide_react_1.ExternalLink className="w-4 h-4 mr-1"/>
                      Open Portal
                    </button_1.Button>
                  </div>
                </div>
                
                {activeApproval.comments && (<div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Initial Comments:</p>
                    <p className="text-sm">{activeApproval.comments}</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Approval History */}
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.MessageCircle className="w-5 h-5"/>
                  Approval History
                </card_1.CardTitle>
                <button_1.Button size="sm" variant="outline" onClick={() => fetchApprovalHistory(design.id)}>
                  <lucide_react_1.RefreshCw className="w-4 h-4 mr-1"/>
                  Refresh
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              {design.approvals.length > 0 ? (<div className="space-y-4">
                  {design.approvals
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(approval => (<div key={approval.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(approval.status)}
                            <div>
                              <div className="flex items-center gap-2">
                                <badge_1.Badge className={getStatusColor(approval.status)}>
                                  {approval.status.replace('_', ' ')}
                                </badge_1.Badge>
                                <span className="font-medium">Version {approval.version}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(approval.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          {approval.status === 'SENT' && (<div className="flex gap-2">
                              <button_1.Button size="sm" variant="outline" onClick={() => copyApprovalLink(approval.portal_token)}>
                                <lucide_react_1.Copy className="w-4 h-4"/>
                              </button_1.Button>
                              <button_1.Button size="sm" variant="outline" onClick={() => openApprovalLink(approval.portal_token)}>
                                <lucide_react_1.ExternalLink className="w-4 h-4"/>
                              </button_1.Button>
                            </div>)}
                        </div>
                        
                        <div className="text-sm space-y-2">
                          <p><strong>Client:</strong> {approval.client.name}</p>
                          {approval.approver_name && (<p><strong>Approved by:</strong> {approval.approver_name}</p>)}
                          {approval.expires_at && (<p><strong>Expires:</strong> {new Date(approval.expires_at).toLocaleDateString()}</p>)}
                        </div>
                        
                        {approval.comments && (<div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium mb-1">Comments:</p>
                            <p className="text-sm">{approval.comments}</p>
                          </div>)}
                      </div>))}
                </div>) : (<div className="text-center py-8">
                  <lucide_react_1.MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                  <p className="text-muted-foreground">No approval history yet</p>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Design Preview */}
          {files.mockup_url && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Design Preview</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <img src={files.mockup_url} alt="Design preview" className="w-full rounded-lg" onError={(e) => {
                e.target.style.display = 'none';
            }}/>
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <button_1.Button size="sm" variant="outline" asChild className="flex-1">
                      <a href={files.mockup_url} target="_blank" rel="noopener noreferrer">
                        <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                        View
                      </a>
                    </button_1.Button>
                    <button_1.Button size="sm" variant="outline" asChild className="flex-1">
                      <a href={files.mockup_url} download>
                        <lucide_react_1.Download className="w-4 h-4 mr-1"/>
                        Download
                      </a>
                    </button_1.Button>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Quick Actions */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Quick Actions</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3">
              <link_1.default href={`/designs/${design.id}`} className="block">
                <button_1.Button className="w-full" variant="outline">
                  <lucide_react_1.Eye className="w-4 h-4 mr-2"/>
                  View Design Details
                </button_1.Button>
              </link_1.default>
              
              <link_1.default href={`/designs/${design.id}/versions/new`} className="block">
                <button_1.Button className="w-full" variant="outline">
                  <lucide_react_1.FileText className="w-4 h-4 mr-2"/>
                  Create New Version
                </button_1.Button>
              </link_1.default>
              
              <link_1.default href={`/orders/${design.order.id}`} className="block">
                <button_1.Button className="w-full" variant="outline">
                  <lucide_react_1.Share className="w-4 h-4 mr-2"/>
                  View Order
                </button_1.Button>
              </link_1.default>
            </card_1.CardContent>
          </card_1.Card>

          {/* Approval Statistics */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Approval Statistics</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Approvals:</span>
                <span className="font-medium">{design._count.approvals}</span>
              </div>
              <separator_1.Separator />
              <div className="flex justify-between">
                <span>Active Requests:</span>
                <span className="font-medium">
                  {design.approvals.filter(a => a.status === 'SENT').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Approved:</span>
                <span className="font-medium text-green-600">
                  {design.approvals.filter(a => a.status === 'APPROVED').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Changes Requested:</span>
                <span className="font-medium text-yellow-600">
                  {design.approvals.filter(a => a.status === 'CHANGES_REQUESTED').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expired:</span>
                <span className="font-medium text-red-600">
                  {design.approvals.filter(a => a.status === 'EXPIRED').length}
                </span>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Design Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Design Information</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3 text-sm">
              <div>
                <strong>Current Version:</strong><br />
                v{design.current_version}
              </div>
              <separator_1.Separator />
              <div>
                <strong>Method:</strong><br />
                <badge_1.Badge variant="outline">{design.method}</badge_1.Badge>
              </div>
              <separator_1.Separator />
              <div>
                <strong>Created:</strong><br />
                {new Date(design.created_at).toLocaleDateString()}
              </div>
              <div>
                <strong>Last Updated:</strong><br />
                {new Date(design.updated_at).toLocaleDateString()}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    </div>);
}
