"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, Phone, CheckCircle, AlertCircle, Clock, ArrowLeft } from "lucide-react";
import { formatDate as formatDateUtil } from "@/lib/utils/date";

type NotificationType = "sms" | "whatsapp";
type MessageType = "order_update" | "payment_reminder" | "delivery_alert" | "custom";

interface NotificationHistory {
  id: string;
  type: NotificationType;
  to: string;
  message: string;
  status: "sent" | "failed" | "pending";
  timestamp: Date;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<NotificationType>("sms");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("custom");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [history, setHistory] = useState<NotificationHistory[]>([]);

  const messageTemplates: Record<MessageType, string> = {
    order_update: "Hi! Your order #[ORDER_NUMBER] status has been updated to [STATUS]. Track your order at [LINK]",
    payment_reminder: "Hello! This is a reminder that payment for order #[ORDER_NUMBER] is due on [DUE_DATE]. Total: ₱[AMOUNT]",
    delivery_alert: "Good news! Your order #[ORDER_NUMBER] is out for delivery and will arrive today. Thank you!",
    custom: "",
  };

  const handleSend = async () => {
    if (!phoneNumber || !message) {
      setResult({ success: false, message: "Please fill in all fields" });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const endpoint = selectedType === "sms"
        ? "/api/notifications/sms"
        : "/api/notifications/whatsapp";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phoneNumber,
          message: message,
          type: messageType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: `${selectedType.toUpperCase()} sent successfully!` });

        // Add to history
        const newNotification: NotificationHistory = {
          id: data.messageId || Math.random().toString(),
          type: selectedType,
          to: phoneNumber,
          message: message.substring(0, 50) + "...",
          status: "sent",
          timestamp: new Date(),
        };
        setHistory([newNotification, ...history]);

        // Clear form
        setPhoneNumber("");
        setMessage("");
      } else {
        setResult({ success: false, message: data.error || "Failed to send notification" });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || "Network error" });
    } finally {
      setSending(false);
    }
  };

  const handleTemplateChange = (type: MessageType) => {
    setMessageType(type);
    if (type !== "custom") {
      setMessage(messageTemplates[type]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp & SMS Notifications</h1>
        <p className="text-gray-600">Send notifications to clients and customers</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Send Notification Form */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Send Notification</h2>

            {/* Type Selector */}
            <div className="mb-6 flex gap-4">
              <button
                onClick={() => setSelectedType("sms")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  selectedType === "sms"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <Phone className="h-5 w-5" />
                <span className="font-semibold">SMS</span>
              </button>
              <button
                onClick={() => setSelectedType("whatsapp")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  selectedType === "whatsapp"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="font-semibold">WhatsApp</span>
              </button>
            </div>

            {/* Message Template */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Message Template
              </label>
              <select
                value={messageType}
                onChange={(e) => handleTemplateChange(e.target.value as MessageType)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="custom">Custom Message</option>
                <option value="order_update">Order Update</option>
                <option value="payment_reminder">Payment Reminder</option>
                <option value="delivery_alert">Delivery Alert</option>
              </select>
            </div>

            {/* Phone Number */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone Number (PH)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Philippine mobile number format
              </p>
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Enter your message here..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                {message.length} characters • {selectedType === "sms" ? "160 chars = 1 SMS" : "No limit"}
              </p>
            </div>

            {/* Result Message */}
            {result && (
              <div
                className={`mb-4 rounded-lg border p-4 ${
                  result.success
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span className="font-medium">{result.message}</span>
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={sending || !phoneNumber || !message}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
              {sending ? "Sending..." : `Send ${selectedType.toUpperCase()}`}
            </button>
          </div>
        </div>

        {/* Notification History */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Notifications</h2>

            {history.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <MessageSquare className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p className="text-sm">No notifications sent yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.type === "sms" ? (
                          <Phone className="h-4 w-4 text-blue-600" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-green-600" />
                        )}
                        <span className="text-sm font-semibold text-gray-900">
                          {item.type.toUpperCase()}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.status === "sent"
                            ? "bg-green-100 text-green-700"
                            : item.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mb-1 text-sm text-gray-600">To: {item.to}</p>
                    <p className="mb-2 text-xs text-gray-500">{item.message}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {item.timestamp.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <p className="mb-2 font-semibold">Setup Instructions:</p>
            <ol className="list-inside list-decimal space-y-1 text-xs">
              <li>Add SMS API key (Semaphore/Twilio) to .env</li>
              <li>Add WhatsApp Business API token to .env</li>
              <li>Test with your own number first</li>
              <li>Configure sender name/number</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
