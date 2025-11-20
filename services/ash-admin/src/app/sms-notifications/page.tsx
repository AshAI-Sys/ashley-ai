"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Shield,
} from "lucide-react";

export default function SMSNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [_selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [_previewMessage, setPreviewMessage] = useState("");
  const [sendResult, setSendResult] = useState<any>(null);
  const [otpResult, setOtpResult] = useState<any>(null);

  useEffect(() => {
    fetchStatus();
    fetchTemplates();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/sms/send");
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error("Error fetching SMS status:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/sms/templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const ____previewTemplate = async (
    templateId: string,
    variables: Record<string, string>
  ) => {
    try {
      const res = await fetch("/api/sms/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: templateId, variables }),
      });
      const data = await res.json();
      setPreviewMessage(data.template.preview);
    } catch (error) {
      console.error("Error previewing template:", error);
    }
  };

  const sendSMS = async () => {
    setLoading(true);
    setSendResult(null);
    try {
      const phone = (document.getElementById("phone") as HTMLInputElement)
        .value;
      const message = (
        document.getElementById("message") as HTMLTextAreaElement
      ).value;

      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message }),
      });
      const data = await res.json();
      setSendResult(data);
    } catch (error: any) {
      setSendResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    setLoading(true);
    setOtpResult(null);
    try {
      const phone = (document.getElementById("otp_phone") as HTMLInputElement)
        .value;

      const res = await fetch("/api/sms/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      setOtpResult(data);
    } catch (error: any) {
      setOtpResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setOtpResult(null);
    try {
      const phone = (
        document.getElementById("verify_phone") as HTMLInputElement
      ).value;
      const code = (document.getElementById("verify_code") as HTMLInputElement)
        .value;

      const res = await fetch("/api/sms/otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      setOtpResult(data);
    } catch (error: any) {
      setOtpResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SMS Notifications</h1>
          <p className="text-muted-foreground">
            Send SMS alerts, OTPs, and notifications
          </p>
        </div>
      </div>

      {/* Provider Status */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle>Provider Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${status.providers.twilio ? "bg-green-500" : "bg-gray-300"}`}
                />
                <div>
                  <p className="font-medium">Twilio</p>
                  <p className="text-sm text-muted-foreground">
                    {status.providers.twilio ? "Configured" : "Not configured"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${status.providers.semaphore ? "bg-green-500" : "bg-gray-300"}`}
                />
                <div>
                  <p className="font-medium">Semaphore (PH)</p>
                  <p className="text-sm text-muted-foreground">
                    {status.providers.semaphore
                      ? "Configured"
                      : "Not configured"}
                    {status.balances?.semaphore &&
                      ` â€¢ ₱${status.balances.semaphore.toFixed(2)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${status.providers.movider ? "bg-green-500" : "bg-gray-300"}`}
                />
                <div>
                  <p className="font-medium">Movider (PH)</p>
                  <p className="text-sm text-muted-foreground">
                    {status.providers.movider ? "Configured" : "Not configured"}
                    {status.balances?.movider &&
                      ` â€¢ ₱${status.balances.movider.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Active Provider:</strong>{" "}
                {status.providers.default || "None"} â€¢ Automatic fallback
                enabled
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList>
          <TabsTrigger value="send">
            <Send className="mr-2 h-4 w-4" />
            Send SMS
          </TabsTrigger>
          <TabsTrigger value="otp">
            <Shield className="mr-2 h-4 w-4" />
            OTP
          </TabsTrigger>
          <TabsTrigger value="templates">
            <MessageSquare className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* SEND SMS TAB */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Send SMS Message</CardTitle>
              <CardDescription>
                Send a direct SMS to any Philippine mobile number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="09171234567" />
                <p className="text-xs text-muted-foreground">
                  Format: 09XXXXXXXXX or +639XXXXXXXXX
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={4}
                  placeholder="Your message here..."
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  Max 160 characters per SMS
                </p>
              </div>
              <Button onClick={sendSMS} disabled={loading} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send SMS
              </Button>

              {sendResult && (
                <div
                  className={`rounded-lg p-4 ${sendResult.success ? "bg-green-50" : "bg-red-50"}`}
                >
                  <div className="flex items-start gap-3">
                    {sendResult.success ? (
                      <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${sendResult.success ? "text-green-800" : "text-red-800"}`}
                      >
                        {sendResult.success
                          ? "SMS sent successfully!"
                          : "Failed to send SMS"}
                      </p>
                      {sendResult.success && (
                        <p className="mt-1 text-sm text-green-600">
                          Provider: {sendResult.provider} â€¢ Message ID:{" "}
                          {sendResult.message_id}
                        </p>
                      )}
                      {sendResult.error && (
                        <p className="mt-1 text-sm text-red-600">
                          {sendResult.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* OTP TAB */}
        <TabsContent value="otp">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Send OTP</CardTitle>
                <CardDescription>
                  Send a 6-digit verification code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp_phone">Phone Number</Label>
                  <Input id="otp_phone" placeholder="09171234567" />
                </div>
                <Button onClick={sendOTP} disabled={loading} className="w-full">
                  Send OTP Code
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verify OTP</CardTitle>
                <CardDescription>Verify the received code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify_phone">Phone Number</Label>
                  <Input id="verify_phone" placeholder="09171234567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verify_code">6-Digit Code</Label>
                  <Input id="verify_code" placeholder="123456" maxLength={6} />
                </div>
                <Button
                  onClick={verifyOTP}
                  disabled={loading}
                  className="w-full"
                >
                  Verify Code
                </Button>
              </CardContent>
            </Card>
          </div>

          {otpResult && (
            <Card
              className={
                otpResult.success ? "border-green-500" : "border-red-500"
              }
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {otpResult.success ? (
                    <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${otpResult.success ? "text-green-800" : "text-red-800"}`}
                    >
                      {otpResult.message || otpResult.error}
                    </p>
                    {otpResult.expires_in && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Code expires in {Math.floor(otpResult.expires_in / 60)}{" "}
                        minutes
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>SMS Templates</CardTitle>
              <CardDescription>
                Pre-defined message templates with variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className="space-y-2 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{template.name}</h3>
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                        {template.id}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.message}
                    </p>
                    {template.variables && (
                      <div className="flex flex-wrap gap-2">
                        {template.variables.map((v: string) => (
                          <span
                            key={v}
                            className="rounded bg-gray-100 px-2 py-1 text-xs"
                          >
                            {`{${v}}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
