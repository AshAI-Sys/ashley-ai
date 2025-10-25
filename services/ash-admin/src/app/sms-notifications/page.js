"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SMSNotificationsPage;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
function SMSNotificationsPage() {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [status, setStatus] = (0, react_1.useState)(null);
    const [templates, setTemplates] = (0, react_1.useState)([]);
    const [selectedTemplate, setSelectedTemplate] = (0, react_1.useState)(null);
    const [previewMessage, setPreviewMessage] = (0, react_1.useState)("");
    const [sendResult, setSendResult] = (0, react_1.useState)(null);
    const [otpResult, setOtpResult] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        fetchStatus();
        fetchTemplates();
    }, []);
    const fetchStatus = async () => {
        try {
            const res = await fetch("/api/sms/send");
            const data = await res.json();
            setStatus(data);
        }
        catch (error) {
            console.error("Error fetching SMS status:", error);
        }
    };
    const fetchTemplates = async () => {
        try {
            const res = await fetch("/api/sms/templates");
            const data = await res.json();
            setTemplates(data.templates || []);
        }
        catch (error) {
            console.error("Error fetching templates:", error);
        }
    };
    const _previewTemplate = async (templateId, variables) => {
        try {
            const res = await fetch("/api/sms/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ template_id: templateId, variables }),
            });
            const data = await res.json();
            setPreviewMessage(data.template.preview);
        }
        catch (error) {
            console.error("Error previewing template:", error);
        }
    };
    const sendSMS = async () => {
        setLoading(true);
        setSendResult(null);
        try {
            const phone = document.getElementById("phone")
                .value;
            const message = document.getElementById("message").value;
            const res = await fetch("/api/sms/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ to: phone, message }),
            });
            const data = await res.json();
            setSendResult(data);
        }
        catch (error) {
            setSendResult({ success: false, error: error.message });
        }
        finally {
            setLoading(false);
        }
    };
    const sendOTP = async () => {
        setLoading(true);
        setOtpResult(null);
        try {
            const phone = document.getElementById("otp_phone")
                .value;
            const res = await fetch("/api/sms/otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            setOtpResult(data);
        }
        catch (error) {
            setOtpResult({ success: false, error: error.message });
        }
        finally {
            setLoading(false);
        }
    };
    const verifyOTP = async () => {
        setLoading(true);
        setOtpResult(null);
        try {
            const phone = document.getElementById("verify_phone").value;
            const code = document.getElementById("verify_code")
                .value;
            const res = await fetch("/api/sms/otp", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, code }),
            });
            const data = await res.json();
            setOtpResult(data);
        }
        catch (error) {
            setOtpResult({ success: false, error: error.message });
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SMS Notifications</h1>
          <p className="text-muted-foreground">
            Send SMS alerts, OTPs, and notifications
          </p>
        </div>
      </div>

      {/* Provider Status */}
      {status && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Provider Status</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${status.providers.twilio ? "bg-green-500" : "bg-gray-300"}`}/>
                <div>
                  <p className="font-medium">Twilio</p>
                  <p className="text-sm text-muted-foreground">
                    {status.providers.twilio ? "Configured" : "Not configured"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${status.providers.semaphore ? "bg-green-500" : "bg-gray-300"}`}/>
                <div>
                  <p className="font-medium">Semaphore (PH)</p>
                  <p className="text-sm text-muted-foreground">
                    {status.providers.semaphore
                ? "Configured"
                : "Not configured"}
                    {status.balances?.semaphore &&
                ` • ₱${status.balances.semaphore.toFixed(2)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${status.providers.movider ? "bg-green-500" : "bg-gray-300"}`}/>
                <div>
                  <p className="font-medium">Movider (PH)</p>
                  <p className="text-sm text-muted-foreground">
                    {status.providers.movider ? "Configured" : "Not configured"}
                    {status.balances?.movider &&
                ` • ₱${status.balances.movider.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Active Provider:</strong>{" "}
                {status.providers.default || "None"} • Automatic fallback
                enabled
              </p>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      <tabs_1.Tabs defaultValue="send" className="space-y-6">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="send">
            <lucide_react_1.Send className="mr-2 h-4 w-4"/>
            Send SMS
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="otp">
            <lucide_react_1.Shield className="mr-2 h-4 w-4"/>
            OTP
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="templates">
            <lucide_react_1.MessageSquare className="mr-2 h-4 w-4"/>
            Templates
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* SEND SMS TAB */}
        <tabs_1.TabsContent value="send">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Send SMS Message</card_1.CardTitle>
              <card_1.CardDescription>
                Send a direct SMS to any Philippine mobile number
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="phone">Phone Number</label_1.Label>
                <input_1.Input id="phone" placeholder="09171234567"/>
                <p className="text-xs text-muted-foreground">
                  Format: 09XXXXXXXXX or +639XXXXXXXXX
                </p>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="message">Message</label_1.Label>
                <textarea_1.Textarea id="message" rows={4} placeholder="Your message here..." maxLength={160}/>
                <p className="text-xs text-muted-foreground">
                  Max 160 characters per SMS
                </p>
              </div>
              <button_1.Button onClick={sendSMS} disabled={loading} className="w-full">
                <lucide_react_1.Send className="mr-2 h-4 w-4"/>
                Send SMS
              </button_1.Button>

              {sendResult && (<div className={`rounded-lg p-4 ${sendResult.success ? "bg-green-50" : "bg-red-50"}`}>
                  <div className="flex items-start gap-3">
                    {sendResult.success ? (<lucide_react_1.CheckCircle className="mt-0.5 h-5 w-5 text-green-600"/>) : (<lucide_react_1.AlertCircle className="mt-0.5 h-5 w-5 text-red-600"/>)}
                    <div className="flex-1">
                      <p className={`font-medium ${sendResult.success ? "text-green-800" : "text-red-800"}`}>
                        {sendResult.success
                ? "SMS sent successfully!"
                : "Failed to send SMS"}
                      </p>
                      {sendResult.success && (<p className="mt-1 text-sm text-green-600">
                          Provider: {sendResult.provider} • Message ID:{" "}
                          {sendResult.message_id}
                        </p>)}
                      {sendResult.error && (<p className="mt-1 text-sm text-red-600">
                          {sendResult.error}
                        </p>)}
                    </div>
                  </div>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* OTP TAB */}
        <tabs_1.TabsContent value="otp">
          <div className="grid gap-6 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Send OTP</card_1.CardTitle>
                <card_1.CardDescription>
                  Send a 6-digit verification code
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="otp_phone">Phone Number</label_1.Label>
                  <input_1.Input id="otp_phone" placeholder="09171234567"/>
                </div>
                <button_1.Button onClick={sendOTP} disabled={loading} className="w-full">
                  Send OTP Code
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Verify OTP</card_1.CardTitle>
                <card_1.CardDescription>Verify the received code</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="verify_phone">Phone Number</label_1.Label>
                  <input_1.Input id="verify_phone" placeholder="09171234567"/>
                </div>
                <div className="space-y-2">
                  <label_1.Label htmlFor="verify_code">6-Digit Code</label_1.Label>
                  <input_1.Input id="verify_code" placeholder="123456" maxLength={6}/>
                </div>
                <button_1.Button onClick={verifyOTP} disabled={loading} className="w-full">
                  Verify Code
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {otpResult && (<card_1.Card className={otpResult.success ? "border-green-500" : "border-red-500"}>
              <card_1.CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {otpResult.success ? (<lucide_react_1.CheckCircle className="mt-0.5 h-5 w-5 text-green-600"/>) : (<lucide_react_1.AlertCircle className="mt-0.5 h-5 w-5 text-red-600"/>)}
                  <div className="flex-1">
                    <p className={`font-medium ${otpResult.success ? "text-green-800" : "text-red-800"}`}>
                      {otpResult.message || otpResult.error}
                    </p>
                    {otpResult.expires_in && (<p className="mt-1 text-sm text-muted-foreground">
                        Code expires in {Math.floor(otpResult.expires_in / 60)}{" "}
                        minutes
                      </p>)}
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>)}
        </tabs_1.TabsContent>

        {/* TEMPLATES TAB */}
        <tabs_1.TabsContent value="templates">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>SMS Templates</card_1.CardTitle>
              <card_1.CardDescription>
                Pre-defined message templates with variables
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid gap-4">
                {templates.map(template => (<div key={template.id} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{template.name}</h3>
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                        {template.id}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.message}
                    </p>
                    {template.variables && (<div className="flex flex-wrap gap-2">
                        {template.variables.map((v) => (<span key={v} className="rounded bg-gray-100 px-2 py-1 text-xs">
                            {`{${v}}`}
                          </span>))}
                      </div>)}
                  </div>))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
