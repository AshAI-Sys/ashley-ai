"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send,
  Mail,
  Clock,
  Users,
  CheckSquare, Square,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface DesignApproval {
  id: string;
  design_asset_id: string;
  design_name: string;
  client_name: string;
  client_email: string;
  status: string;
  version: number;
  created_at: string;
  expires_at?: string;
}

interface BatchApprovalActionsProps {
  approvals: DesignApproval[];
  onRefresh: () => void;
  className?: string;
}

const MESSAGE_TEMPLATES = [
  {
    id: "reminder",
    name: "Gentle Reminder",
    subject: "Reminder: Design Approval Pending",
    content: `Hi {{client_name}},

This is a friendly reminder that we're still waiting for your approval on the design "{{design_name}}".

Please review and provide your feedback when you have a moment:
{{approval_link}}

Thank you for your time!

Best regards,
Ashley AI Team`,
  },
  {
    id: "urgent_reminder",
    name: "Urgent Reminder",
    subject: "URGENT: Design Approval Required",
    content: `Hi {{client_name}},

We urgently need your approval for "{{design_name}}" to stay on schedule for production.

Please review as soon as possible:
{{approval_link}}

If you need any changes or have questions, please let us know immediately.

Best regards,
Ashley AI Team`,
  },
  {
    id: "final_notice",
    name: "Final Notice",
    subject: "FINAL NOTICE: Design Approval Expires Soon",
    content: `Hi {{client_name}},

This is a final notice that your approval for "{{design_name}}" will expire soon.

Expiry Date: {{expiry_date}}
Review Link: {{approval_link}}

After expiry, we may need to proceed with production using the current design or delay your order.

Please respond immediately if you need more time.

Best regards,
Ashley AI Team`,
  },
];

export function BatchApprovalActions({
  approvals,
  onRefresh,
  className = "",
}: BatchApprovalActionsProps) {
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
  const [actionType, setActionType] = useState<
    "send_reminder" | "extend_expiry" | "cancel_approval" | ""
  >("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [extensionDays, setExtensionDays] = useState("3");
  const [submitting, setSubmitting] = useState(false);

  // Filter approvals that can have actions performed on them
  const actionableApprovals = approvals.filter(approval =>
    ["SENT"].includes(approval.status.toUpperCase())
  );

  const expiringSoon = actionableApprovals.filter(approval => {
    if (!approval.expires_at) return false;
    const expiryDate = new Date(approval.expires_at);
    const now = new Date();
    const hoursUntilExpiry =
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
  });

  const overdue = actionableApprovals.filter(approval => {
    if (!approval.expires_at) return false;
    return new Date(approval.expires_at) < new Date();
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApprovals(actionableApprovals.map(a => a.id));
    } else {
      setSelectedApprovals([]);
    }
  };

  const handleSelectApproval = (approvalId: string, checked: boolean) => {
    if (checked) {
      setSelectedApprovals(prev => [...prev, approvalId]);
    } else {
      setSelectedApprovals(prev => prev.filter(id => id !== approvalId));
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setCustomMessage(template.content);
    }
  };

  const handleBatchAction = async () => {
    if (selectedApprovals.length === 0) {
      toast.error("Please select at least one approval");
      return;
    }

    if (!actionType) {
      toast.error("Please select an action");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        approval_ids: selectedApprovals,
        action: actionType,
        ...(actionType === "send_reminder" && {
          template_id: selectedTemplate,
          message: customMessage,
        }),
        ...(actionType === "extend_expiry" && {
          extension_days: parseInt(extensionDays),
        }),
      };

      const response = await fetch("/api/approvals/batch-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `Successfully ${
            actionType === "send_reminder"
              ? "sent reminders"
              : actionType === "extend_expiry"
                ? "extended expiry dates"
                : "cancelled approvals"
          } for ${selectedApprovals.length} approval${selectedApprovals.length > 1 ? "s" : ""}`
        );

        setSelectedApprovals([]);
        setActionType("");
        setSelectedTemplate("");
        setCustomMessage("");
        onRefresh();
      } else {
        toast.error(result.message || "Failed to perform batch action");
      }
    } catch (error) {
      console.error("Batch action failed:", error);
      toast.error("Failed to perform batch action");
    } finally {
      setSubmitting(false);
    }
  };

  if (actionableApprovals.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            No pending approvals to manage
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Batch Approval Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {actionableApprovals.length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {expiringSoon.length}
            </div>
            <div className="text-sm text-muted-foreground">Expiring Soon</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {overdue.length}
            </div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </div>
        </div>

        {/* Selection */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedApprovals.length === actionableApprovals.length
                }
                onCheckedChange={handleSelectAll}
              />
              <Label className="text-sm font-medium">
                Select All ({actionableApprovals.length} items)
              </Label>
            </div>
            {selectedApprovals.length > 0 && (
              <Badge variant="secondary">
                {selectedApprovals.length} selected
              </Badge>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto rounded-lg border">
            {actionableApprovals.map(approval => {
              const isExpiringSoon = expiringSoon.some(
                a => a.id === approval.id
              );
              const isOverdue = overdue.some(a => a.id === approval.id);

              return (
                <div
                  key={approval.id}
                  className={`flex items-center gap-3 border-b p-3 last:border-b-0 hover:bg-gray-50 ${
                    isOverdue
                      ? "bg-red-50"
                      : isExpiringSoon
                        ? "bg-yellow-50"
                        : ""
                  }`}
                >
                  <Checkbox
                    checked={selectedApprovals.includes(approval.id)}
                    onCheckedChange={checked =>
                      handleSelectApproval(approval.id, checked as boolean)
                    }
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {approval.design_name}
                      </p>
                      <Badge variant="outline" size="sm">
                        v{approval.version}
                      </Badge>
                      {isOverdue && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      {isExpiringSoon && (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {approval.client_name} •
                      {approval.expires_at && (
                        <>
                          {" "}
                          Expires:{" "}
                          {new Date(approval.expires_at).toLocaleDateString()}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Selection */}
        <div className="space-y-4">
          <div>
            <Label>Action to Perform</Label>
            <Select
              value={actionType}
              onValueChange={value => setActionType(value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_reminder">
                  Send Reminder Email
                </SelectItem>
                <SelectItem value="extend_expiry">
                  Extend Expiry Date
                </SelectItem>
                <SelectItem value="cancel_approval">
                  Cancel Approval Request
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reminder Options */}
          {actionType === "send_reminder" && (
            <div className="space-y-4 rounded-lg border bg-blue-50 p-4">
              <div>
                <Label>Message Template</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {MESSAGE_TEMPLATES.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Message Content</Label>
                <Textarea
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={6}
                />
              </div>
            </div>
          )}

          {/* Extend Expiry Options */}
          {actionType === "extend_expiry" && (
            <div className="space-y-4 rounded-lg border bg-yellow-50 p-4">
              <div>
                <Label>Extend by</Label>
                <Select value={extensionDays} onValueChange={setExtensionDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Cancel Confirmation */}
          {actionType === "cancel_approval" && (
            <div className="rounded-lg border bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">
                  This will cancel the selected approval requests. This action
                  cannot be undone.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Execute Button */}
        <Button
          onClick={handleBatchAction}
          disabled={submitting || selectedApprovals.length === 0 || !actionType}
          className="w-full"
          size="lg"
        >
          {submitting ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {actionType === "send_reminder" && (
                <Mail className="mr-2 h-4 w-4" />
              )}
              {actionType === "extend_expiry" && (
                <Clock className="mr-2 h-4 w-4" />
              )}
              {actionType === "cancel_approval" && (
                <AlertCircle className="mr-2 h-4 w-4" />
              )}

              {actionType === "send_reminder" &&
                `Send Reminder to ${selectedApprovals.length} Client${selectedApprovals.length > 1 ? "s" : ""}`}
              {actionType === "extend_expiry" &&
                `Extend ${selectedApprovals.length} Expiry Date${selectedApprovals.length > 1 ? "s" : ""}`}
              {actionType === "cancel_approval" &&
                `Cancel ${selectedApprovals.length} Approval${selectedApprovals.length > 1 ? "s" : ""}`}
              {!actionType && "Select Action"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
