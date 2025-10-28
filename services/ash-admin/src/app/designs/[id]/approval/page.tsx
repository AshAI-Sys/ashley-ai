"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Send,
  Copy,
  Eye,
  Download,
  MessageCircle,
  CheckCircle,
  Clock,
  Image,
  FileText,
  Palette,
  Share,
  Users,
  Mail,
  Calendar,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface DesignAsset {
  id: string;
  name: string;
  method: string;
  status: string;
  current_version: number;
  is_best_seller: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  order: {
    id: string;
    order_number: string;
    status: string;
    client: {
      id: string;
      name: string;
      email: string;
      contact_person: string;
    };
  };
  brand: {
    id: string;
    name: string;
    code: string;
  };
  versions: Array<{
    id: string;
    version: number;
    files: string;
    placements: string;
    palette: string;
    meta: string;
    created_by: string;
    created_at: string;
  }>;
  approvals: Array<{
    id: string;
    status: string;
    version: number;
    comments: string;
    approver_name: string;
    approver_email: string;
    portal_token: string;
    expires_at: string;
    created_at: string;
    client: {
      name: string;
    };
  }>;
  _count: {
    versions: number;
    approvals: number;
    checks: number;
  };
}

interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "initial_approval",
    name: "Initial Design Approval",
    subject: "Please Review Your Design - {{design_name}}",
    content: `Hi {{client_name}},

Your design "{{design_name}}" is ready for your review and approval.

Please click the link below to view the mockup and provide your feedback:
{{approval_link}}

If you have any questions, please don't hesitate to reach out.

Best regards,
Ashley AI Team`,
  },
  {
    id: "revision_request",
    name: "Design Revision Request",
    subject: "Updated Design Ready for Review - {{design_name}}",
    content: `Hi {{client_name}},

We've updated your design "{{design_name}}" based on your feedback.

Please review the new version and let us know if this meets your requirements:
{{approval_link}}

Thank you for your patience.

Best regards,
Ashley AI Team`,
  },
  {
    id: "urgent_approval",
    name: "Urgent Approval Needed",
    subject: "URGENT: Design Approval Required - {{design_name}}",
    content: `Hi {{client_name}},

We need your urgent approval for "{{design_name}}" to meet your production deadline.

Please review and approve as soon as possible:
{{approval_link}}

Production is scheduled to begin soon, so please respond at your earliest convenience.

Best regards,
Ashley AI Team`,
  },
  {
    id: "reminder",
    name: "Approval Reminder",
    subject: "Reminder: Design Approval Pending - {{design_name}}",
    content: `Hi {{client_name}},

This is a friendly reminder that your design "{{design_name}}" is still pending your approval.

Please take a moment to review:
{{approval_link}}

If you need any changes or have questions, please let us know.

Best regards,
Ashley AI Team`,
  },
];

export default function DesignApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const [design, setDesign] = useState<DesignAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");
  const [selectedVersion, setSelectedVersion] = useState<number>(0);
  const [_approvalHistory, setApprovalHistory] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchDesign(params.id as string);
      fetchApprovalHistory(params.id as string);
    }
  }, [params.id]);

  const fetchDesign = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/designs/${id}?include=order,brand,versions,approvals,checks`
      );
      const data = await response.json();

      if (data.success) {
        setDesign(data.data);
        setSelectedVersion(data.data.current_version);
      } else {
        toast.error("Failed to fetch design details");
        router.push("/designs");
      }
    } catch (error) {
      console.error("Failed to fetch design:", error);
      toast.error("Failed to fetch design details");
      router.push("/designs");
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/designs/${id}/approval-history`);
      const data = await response.json();

      if (data.success) {
        setApprovalHistory(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch approval history:", error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);

    if (template && design) {
      const subject = template.subject
        .replace("{{design_name}}", design.name)
        .replace("{{client_name}}", design.order.client.name);

      const content = template.content
        .replace("{{design_name}}", design.name)
        .replace("{{client_name}}", design.order.client.name)
        .replace("{{approval_link}}", "[Link will be generated]");

      setEmailSubject(subject);
      setCustomMessage(content);
    }
  };

  const handleSendForApproval = async () => {
    if (!design) return;

    if (!emailSubject.trim() || !customMessage.trim()) {
      toast.error("Please provide both subject and message");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/designs/${design.id}/send-approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: selectedVersion,
          email_subject: emailSubject,
          message: customMessage,
          expiry_days: parseInt(expiryDays),
          template_id: selectedTemplate,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Design sent for client approval");
        fetchDesign(design.id);
        fetchApprovalHistory(design.id);
        // Reset form
        setSelectedTemplate("");
        setCustomMessage("");
        setEmailSubject("");
      } else {
        toast.error(result.message || "Failed to send approval");
      }
    } catch (error) {
      console.error("Failed to send approval:", error);
      toast.error("Failed to send approval");
    } finally {
      setSubmitting(false);
    }
  };

  const copyApprovalLink = async (token: string) => {
    const portalUrl =
      process.env.NODE_ENV === "production"
        ? "https://portal.ashleyai.com"
        : "http://localhost:3003";

    const approvalLink = `${portalUrl}/approval/${token}`;

    try {
      await navigator.clipboard.writeText(approvalLink);
      toast.success("Approval link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const openApprovalLink = (token: string) => {
    const portalUrl =
      process.env.NODE_ENV === "production"
        ? "https://portal.ashleyai.com"
        : "http://localhost:3003";

    const approvalLink = `${portalUrl}/approval/${token}`;
    window.open(approvalLink, "_blank");
  };

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toUpperCase()) {
      case "SENT":
        return "bg-blue-100 text-blue-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "CHANGES_REQUESTED":
        return "bg-yellow-100 text-yellow-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    if (!status) return <Clock className="h-4 w-4" />;
    switch (status.toUpperCase()) {
      case "SENT":
        return <Clock className="h-4 w-4" />;
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />;
      case "CHANGES_REQUESTED":
        return <MessageCircle className="h-4 w-4" />;
      case "EXPIRED":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Design not found</p>
            <Link href="/designs">
              <Button className="mt-4">Back to Designs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentVersion = design.versions.find(
    v => v.version === selectedVersion
  );
  const files = currentVersion ? JSON.parse(currentVersion.files) : {};
  const activeApproval = design.approvals.find(a => a.status === "SENT");

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/designs/${design.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Design
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Client Approval Management</h1>
            <p className="text-muted-foreground">
              {design.name} â€¢ {design.order.order_number} â€¢ {design.brand.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(design.status)}>
            {design.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Send New Approval */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send for Client Approval
              </CardTitle>
              <CardDescription>
                Create and send a new approval request to the client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client Information */}
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Client Information</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Client:</strong> {design.order.client.name}
                  </p>
                  <p>
                    <strong>Contact:</strong>{" "}
                    {design.order.client.contact_person}
                  </p>
                  <p>
                    <strong>Email:</strong> {design.order.client.email}
                  </p>
                </div>
              </div>

              {/* Version Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="version">Version to Send</Label>
                  <Select
                    value={selectedVersion.toString()}
                    onValueChange={value => setSelectedVersion(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      {design.versions
                        .sort((a, b) => b.version - a.version)
                        .map(version => (
                          <SelectItem
                            key={version.id}
                            value={version.version.toString()}
                          >
                            Version {version.version}
                            {version.version === design.current_version &&
                              " (Current)"}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expiry">Expires In (Days)</Label>
                  <Select value={expiryDays} onValueChange={setExpiryDays}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expiry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message Templates */}
              <div>
                <Label htmlFor="template">Message Template</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template or write custom message" />
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

              {/* Email Subject */}
              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                />
              </div>

              {/* Custom Message */}
              <div>
                <Label htmlFor="message">Message Content</Label>
                <Textarea
                  id="message"
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="Enter your message to the client..."
                  rows={8}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleSendForApproval}
                disabled={
                  submitting || !emailSubject.trim() || !customMessage.trim()
                }
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "Sending..." : "Send for Approval"}
              </Button>
            </CardContent>
          </Card>

          {/* Active Approval */}
          {activeApproval && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Active Approval Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(activeApproval.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getStatusColor(activeApproval.status)}
                        >
                          {activeApproval.status.replace("_", " ")}
                        </Badge>
                        <span className="font-medium">
                          Version {activeApproval.version}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sent:{" "}
                        {new Date(
                          activeApproval.created_at
                        ).toLocaleDateString()}
                        {activeApproval.expires_at && (
                          <>
                            {" â€¢ "}
                            Expires:{" "}
                            {new Date(
                              activeApproval.expires_at
                            ).toLocaleDateString()}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyApprovalLink(activeApproval.portal_token)
                      }
                    >
                      <Copy className="mr-1 h-4 w-4" />
                      Copy Link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        openApprovalLink(activeApproval.portal_token)
                      }
                    >
                      <ExternalLink className="mr-1 h-4 w-4" />
                      Open Portal
                    </Button>
                  </div>
                </div>

                {activeApproval.comments && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="mb-1 text-sm font-medium">
                      Initial Comments:
                    </p>
                    <p className="text-sm">{activeApproval.comments}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Approval History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Approval History
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchApprovalHistory(design.id)}
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {design.approvals.length > 0 ? (
                <div className="space-y-4">
                  {design.approvals
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .map(approval => (
                      <div key={approval.id} className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(approval.status)}
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getStatusColor(approval.status)}
                                >
                                  {approval.status.replace("_", " ")}
                                </Badge>
                                <span className="font-medium">
                                  Version {approval.version}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(approval.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {approval.status === "SENT" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  copyApprovalLink(approval.portal_token)
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openApprovalLink(approval.portal_token)
                                }
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Client:</strong> {approval.client.name}
                          </p>
                          {approval.approver_name && (
                            <p>
                              <strong>Approved by:</strong>{" "}
                              {approval.approver_name}
                            </p>
                          )}
                          {approval.expires_at && (
                            <p>
                              <strong>Expires:</strong>{" "}
                              {new Date(
                                approval.expires_at
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        {approval.comments && (
                          <div className="mt-3 rounded bg-gray-50 p-3">
                            <p className="mb-1 text-sm font-medium">
                              Comments:
                            </p>
                            <p className="text-sm">{approval.comments}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No approval history yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Design Preview */}
          {files.mockup_url && (
            <Card>
              <CardHeader>
                <CardTitle>Design Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={files.mockup_url}
                  alt="Design preview"
                  className="w-full rounded-lg"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="flex-1"
                    >
                      <a
                        href={files.mockup_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="flex-1"
                    >
                      <a href={files.mockup_url} download>
                        <Download className="mr-1 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/designs/${design.id}`} className="block">
                <Button className="w-full" variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  View Design Details
                </Button>
              </Link>

              <Link
                href={`/designs/${design.id}/versions/new`}
                className="block"
              >
                <Button className="w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Version
                </Button>
              </Link>

              <Link href={`/orders/${design.order.id}`} className="block">
                <Button className="w-full" variant="outline">
                  <Share className="mr-2 h-4 w-4" />
                  View Order
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Approval Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Approval Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Approvals:</span>
                <span className="font-medium">{design._count.approvals}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Active Requests:</span>
                <span className="font-medium">
                  {design.approvals.filter(a => a.status === "SENT").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Approved:</span>
                <span className="font-medium text-green-600">
                  {design.approvals.filter(a => a.status === "APPROVED").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Changes Requested:</span>
                <span className="font-medium text-yellow-600">
                  {
                    design.approvals.filter(
                      a => a.status === "CHANGES_REQUESTED"
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expired:</span>
                <span className="font-medium text-red-600">
                  {design.approvals.filter(a => a.status === "EXPIRED").length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Design Information */}
          <Card>
            <CardHeader>
              <CardTitle>Design Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>Current Version:</strong>
                <br />v{design.current_version}
              </div>
              <Separator />
              <div>
                <strong>Method:</strong>
                <br />
                <Badge variant="outline">{design.method}</Badge>
              </div>
              <Separator />
              <div>
                <strong>Created:</strong>
                <br />
                {new Date(design.created_at).toLocaleDateString()}
              </div>
              <div>
                <strong>Last Updated:</strong>
                <br />
                {new Date(design.updated_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
