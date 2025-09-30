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
exports.BatchApprovalActions = BatchApprovalActions;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const checkbox_1 = require("@/components/ui/checkbox");
const select_1 = require("@/components/ui/select");
const textarea_1 = require("@/components/ui/textarea");
const label_1 = require("@/components/ui/label");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
const MESSAGE_TEMPLATES = [
    {
        id: 'reminder',
        name: 'Gentle Reminder',
        subject: 'Reminder: Design Approval Pending',
        content: `Hi {{client_name}},

This is a friendly reminder that we're still waiting for your approval on the design "{{design_name}}".

Please review and provide your feedback when you have a moment:
{{approval_link}}

Thank you for your time!

Best regards,
Ashley AI Team`
    },
    {
        id: 'urgent_reminder',
        name: 'Urgent Reminder',
        subject: 'URGENT: Design Approval Required',
        content: `Hi {{client_name}},

We urgently need your approval for "{{design_name}}" to stay on schedule for production.

Please review as soon as possible:
{{approval_link}}

If you need any changes or have questions, please let us know immediately.

Best regards,
Ashley AI Team`
    },
    {
        id: 'final_notice',
        name: 'Final Notice',
        subject: 'FINAL NOTICE: Design Approval Expires Soon',
        content: `Hi {{client_name}},

This is a final notice that your approval for "{{design_name}}" will expire soon.

Expiry Date: {{expiry_date}}
Review Link: {{approval_link}}

After expiry, we may need to proceed with production using the current design or delay your order.

Please respond immediately if you need more time.

Best regards,
Ashley AI Team`
    }
];
function BatchApprovalActions({ approvals, onRefresh, className = '' }) {
    const [selectedApprovals, setSelectedApprovals] = (0, react_1.useState)([]);
    const [actionType, setActionType] = (0, react_1.useState)('');
    const [selectedTemplate, setSelectedTemplate] = (0, react_1.useState)('');
    const [customMessage, setCustomMessage] = (0, react_1.useState)('');
    const [extensionDays, setExtensionDays] = (0, react_1.useState)('3');
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    // Filter approvals that can have actions performed on them
    const actionableApprovals = approvals.filter(approval => ['SENT'].includes(approval.status.toUpperCase()));
    const expiringSoon = actionableApprovals.filter(approval => {
        if (!approval.expires_at)
            return false;
        const expiryDate = new Date(approval.expires_at);
        const now = new Date();
        const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
    });
    const overdue = actionableApprovals.filter(approval => {
        if (!approval.expires_at)
            return false;
        return new Date(approval.expires_at) < new Date();
    });
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedApprovals(actionableApprovals.map(a => a.id));
        }
        else {
            setSelectedApprovals([]);
        }
    };
    const handleSelectApproval = (approvalId, checked) => {
        if (checked) {
            setSelectedApprovals(prev => [...prev, approvalId]);
        }
        else {
            setSelectedApprovals(prev => prev.filter(id => id !== approvalId));
        }
    };
    const handleTemplateChange = (templateId) => {
        setSelectedTemplate(templateId);
        const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);
        if (template) {
            setCustomMessage(template.content);
        }
    };
    const handleBatchAction = async () => {
        if (selectedApprovals.length === 0) {
            react_hot_toast_1.toast.error('Please select at least one approval');
            return;
        }
        if (!actionType) {
            react_hot_toast_1.toast.error('Please select an action');
            return;
        }
        try {
            setSubmitting(true);
            const payload = {
                approval_ids: selectedApprovals,
                action: actionType,
                ...(actionType === 'send_reminder' && {
                    template_id: selectedTemplate,
                    message: customMessage
                }),
                ...(actionType === 'extend_expiry' && {
                    extension_days: parseInt(extensionDays)
                })
            };
            const response = await fetch('/api/approvals/batch-actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (response.ok) {
                react_hot_toast_1.toast.success(`Successfully ${actionType === 'send_reminder' ? 'sent reminders' :
                    actionType === 'extend_expiry' ? 'extended expiry dates' :
                        'cancelled approvals'} for ${selectedApprovals.length} approval${selectedApprovals.length > 1 ? 's' : ''}`);
                setSelectedApprovals([]);
                setActionType('');
                setSelectedTemplate('');
                setCustomMessage('');
                onRefresh();
            }
            else {
                react_hot_toast_1.toast.error(result.message || 'Failed to perform batch action');
            }
        }
        catch (error) {
            console.error('Batch action failed:', error);
            react_hot_toast_1.toast.error('Failed to perform batch action');
        }
        finally {
            setSubmitting(false);
        }
    };
    if (actionableApprovals.length === 0) {
        return (<card_1.Card className={className}>
        <card_1.CardContent className="py-8 text-center">
          <lucide_react_1.Users className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
          <p className="text-muted-foreground">No pending approvals to manage</p>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.CheckSquare className="w-5 h-5"/>
          Batch Approval Management
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{actionableApprovals.length}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{expiringSoon.length}</div>
            <div className="text-sm text-muted-foreground">Expiring Soon</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{overdue.length}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </div>
        </div>

        {/* Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <checkbox_1.Checkbox checked={selectedApprovals.length === actionableApprovals.length} onCheckedChange={handleSelectAll}/>
              <label_1.Label className="text-sm font-medium">
                Select All ({actionableApprovals.length} items)
              </label_1.Label>
            </div>
            {selectedApprovals.length > 0 && (<badge_1.Badge variant="secondary">
                {selectedApprovals.length} selected
              </badge_1.Badge>)}
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {actionableApprovals.map(approval => {
            const isExpiringSoon = expiringSoon.some(a => a.id === approval.id);
            const isOverdue = overdue.some(a => a.id === approval.id);
            return (<div key={approval.id} className={`flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : isExpiringSoon ? 'bg-yellow-50' : ''}`}>
                  <checkbox_1.Checkbox checked={selectedApprovals.includes(approval.id)} onCheckedChange={(checked) => handleSelectApproval(approval.id, checked)}/>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {approval.design_name}
                      </p>
                      <badge_1.Badge variant="outline" size="sm">
                        v{approval.version}
                      </badge_1.Badge>
                      {isOverdue && <lucide_react_1.AlertCircle className="w-4 h-4 text-red-500"/>}
                      {isExpiringSoon && <lucide_react_1.Clock className="w-4 h-4 text-yellow-500"/>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {approval.client_name} • 
                      {approval.expires_at && (<> Expires: {new Date(approval.expires_at).toLocaleDateString()}</>)}
                    </p>
                  </div>
                </div>);
        })}
          </div>
        </div>

        {/* Action Selection */}
        <div className="space-y-4">
          <div>
            <label_1.Label>Action to Perform</label_1.Label>
            <select_1.Select value={actionType} onValueChange={(value) => setActionType(value)}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Select an action"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="send_reminder">Send Reminder Email</select_1.SelectItem>
                <select_1.SelectItem value="extend_expiry">Extend Expiry Date</select_1.SelectItem>
                <select_1.SelectItem value="cancel_approval">Cancel Approval Request</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {/* Reminder Options */}
          {actionType === 'send_reminder' && (<div className="space-y-4 p-4 border rounded-lg bg-blue-50">
              <div>
                <label_1.Label>Message Template</label_1.Label>
                <select_1.Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Choose a template"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {MESSAGE_TEMPLATES.map(template => (<select_1.SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div>
                <label_1.Label>Message Content</label_1.Label>
                <textarea_1.Textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Enter your message..." rows={6}/>
              </div>
            </div>)}

          {/* Extend Expiry Options */}
          {actionType === 'extend_expiry' && (<div className="space-y-4 p-4 border rounded-lg bg-yellow-50">
              <div>
                <label_1.Label>Extend by</label_1.Label>
                <select_1.Select value={extensionDays} onValueChange={setExtensionDays}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="1">1 Day</select_1.SelectItem>
                    <select_1.SelectItem value="3">3 Days</select_1.SelectItem>
                    <select_1.SelectItem value="7">7 Days</select_1.SelectItem>
                    <select_1.SelectItem value="14">14 Days</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>)}

          {/* Cancel Confirmation */}
          {actionType === 'cancel_approval' && (<div className="p-4 border rounded-lg bg-red-50">
              <div className="flex items-center gap-2 text-red-800">
                <lucide_react_1.AlertCircle className="w-4 h-4"/>
                <p className="text-sm font-medium">
                  This will cancel the selected approval requests. This action cannot be undone.
                </p>
              </div>
            </div>)}
        </div>

        {/* Execute Button */}
        <button_1.Button onClick={handleBatchAction} disabled={submitting || selectedApprovals.length === 0 || !actionType} className="w-full" size="lg">
          {submitting ? (<>
              <lucide_react_1.Clock className="w-4 h-4 mr-2 animate-spin"/>
              Processing...
            </>) : (<>
              {actionType === 'send_reminder' && <lucide_react_1.Mail className="w-4 h-4 mr-2"/>}
              {actionType === 'extend_expiry' && <lucide_react_1.Clock className="w-4 h-4 mr-2"/>}
              {actionType === 'cancel_approval' && <lucide_react_1.AlertCircle className="w-4 h-4 mr-2"/>}
              
              {actionType === 'send_reminder' && `Send Reminder to ${selectedApprovals.length} Client${selectedApprovals.length > 1 ? 's' : ''}`}
              {actionType === 'extend_expiry' && `Extend ${selectedApprovals.length} Expiry Date${selectedApprovals.length > 1 ? 's' : ''}`}
              {actionType === 'cancel_approval' && `Cancel ${selectedApprovals.length} Approval${selectedApprovals.length > 1 ? 's' : ''}`}
              {!actionType && 'Select Action'}
            </>)}
        </button_1.Button>
      </card_1.CardContent>
    </card_1.Card>);
}
