"use client";
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
exports.FeedbackForm = FeedbackForm;
const react_1 = __importStar(require("react"));
const card_1 = require("@ash-ai/ui/card");
const button_1 = require("@ash-ai/ui/button");
const textarea_1 = require("@ash-ai/ui/textarea");
const input_1 = require("@ash-ai/ui/input");
const label_1 = require("@ash-ai/ui/label");
const badge_1 = require("@ash-ai/ui/badge");
const lucide_react_1 = require("lucide-react");
const PRIORITY_OPTIONS = [
    {
        value: "low",
        label: "Low Priority",
        color: "bg-gray-100 text-gray-800",
        icon: "🔵",
    },
    {
        value: "normal",
        label: "Normal",
        color: "bg-blue-100 text-blue-800",
        icon: "🟡",
    },
    {
        value: "high",
        label: "High Priority",
        color: "bg-orange-100 text-orange-800",
        icon: "🟠",
    },
    {
        value: "urgent",
        label: "Urgent",
        color: "bg-red-100 text-red-800",
        icon: "🔴",
    },
];
const QUICK_FEEDBACK_OPTIONS = [
    "The colors look great!",
    "Perfect size and placement",
    "Love the overall design",
    "Please make the text larger",
    "Can we change the color scheme?",
    "The logo needs to be bigger",
    "Move the design to the center",
    "Use a different font style",
    "Add more contrast",
    "Remove the background element",
];
function FeedbackForm({ designName, version, onSubmit, submitting = false, disabled = false, className = "", }) {
    const [rating, setRating] = (0, react_1.useState)();
    const [feedback, setFeedback] = (0, react_1.useState)("");
    const [changeRequests, setChangeRequests] = (0, react_1.useState)([]);
    const [newChangeRequest, setNewChangeRequest] = (0, react_1.useState)("");
    const [attachments, setAttachments] = (0, react_1.useState)([]);
    const [priority, setPriority] = (0, react_1.useState)("normal");
    const handleSubmit = () => {
        if (!feedback.trim())
            return;
        const data = {
            rating,
            feedback: feedback.trim(),
            change_requests: changeRequests.filter(req => req.trim()),
            attachments,
            priority,
        };
        onSubmit(data);
    };
    const addChangeRequest = () => {
        if (newChangeRequest.trim()) {
            setChangeRequests(prev => [...prev, newChangeRequest.trim()]);
            setNewChangeRequest("");
        }
    };
    const removeChangeRequest = (index) => {
        setChangeRequests(prev => prev.filter((_, i) => i !== index));
    };
    const addQuickFeedback = (text) => {
        if (feedback.trim()) {
            setFeedback(prev => prev + "\n" + text);
        }
        else {
            setFeedback(text);
        }
    };
    const handleFileChange = (event) => {
        const files = event.target.files;
        if (files) {
            const newFiles = Array.from(files).filter(file => {
                // Limit file size to 10MB
                if (file.size > 10 * 1024 * 1024) {
                    alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
                    return false;
                }
                return true;
            });
            setAttachments(prev => [...prev, ...newFiles]);
        }
    };
    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    const isSubmitDisabled = disabled || submitting || !feedback.trim();
    const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === priority);
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.MessageCircle className="h-5 w-5"/>
          Your Feedback
          <badge_1.Badge variant="outline">v{version}</badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Rating */}
        <div>
          <label_1.Label className="mb-3 block text-base font-medium">
            How do you feel about this design? (Optional)
          </label_1.Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (<button key={star} type="button" onClick={() => setRating(rating === star ? undefined : star)} className={`rounded p-2 transition-colors ${rating && rating >= star
                ? "text-yellow-500 hover:text-yellow-600"
                : "text-gray-300 hover:text-yellow-400"}`} disabled={disabled}>
                <lucide_react_1.Star className={`h-6 w-6 ${rating && rating >= star ? "fill-current" : ""}`}/>
              </button>))}
          </div>
          {rating && (<p className="text-muted-foreground mt-2 text-sm">
              {rating === 1 && "We'll work on improvements"}
              {rating === 2 && "Thanks for the feedback"}
              {rating === 3 && "Good to know your thoughts"}
              {rating === 4 && "Great! We're glad you like it"}
              {rating === 5 && "Awesome! We're thrilled you love it"}
            </p>)}
        </div>

        {/* Quick Feedback Options */}
        <div>
          <label_1.Label className="mb-2 block text-sm font-medium">
            Quick Feedback
          </label_1.Label>
          <div className="flex flex-wrap gap-2">
            {QUICK_FEEDBACK_OPTIONS.map((option, index) => (<button_1.Button key={index} type="button" size="sm" variant="outline" onClick={() => addQuickFeedback(option)} disabled={disabled} className="text-xs">
                {option}
              </button_1.Button>))}
          </div>
        </div>

        {/* Main Feedback */}
        <div>
          <label_1.Label htmlFor="feedback" className="text-base font-medium">
            Your Comments *
          </label_1.Label>
          <textarea_1.Textarea id="feedback" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Please share your thoughts about this design. Be as specific as possible to help us understand what you'd like to see..." rows={6} disabled={disabled} className="mt-2"/>
          <p className="text-muted-foreground mt-1 text-xs">
            {feedback.length}/1000 characters
          </p>
        </div>

        {/* Change Requests */}
        <div>
          <label_1.Label className="mb-2 block text-base font-medium">
            Specific Change Requests (Optional)
          </label_1.Label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input_1.Input value={newChangeRequest} onChange={e => setNewChangeRequest(e.target.value)} placeholder="e.g., Make the logo 20% bigger" disabled={disabled} onKeyPress={e => e.key === "Enter" && addChangeRequest()}/>
              <button_1.Button type="button" onClick={addChangeRequest} disabled={disabled || !newChangeRequest.trim()} size="sm">
                Add
              </button_1.Button>
            </div>

            {changeRequests.length > 0 && (<div className="space-y-2">
                {changeRequests.map((request, index) => (<div key={index} className="flex items-center justify-between rounded border border-yellow-200 bg-yellow-50 p-2">
                    <span className="text-sm">{request}</span>
                    <button_1.Button type="button" size="sm" variant="ghost" onClick={() => removeChangeRequest(index)} disabled={disabled}>
                      <lucide_react_1.X className="h-4 w-4"/>
                    </button_1.Button>
                  </div>))}
              </div>)}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label_1.Label className="mb-3 block text-base font-medium">
            Priority Level
          </label_1.Label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {PRIORITY_OPTIONS.map(option => (<button key={option.value} type="button" onClick={() => setPriority(option.value)} disabled={disabled} className={`rounded-lg border p-3 text-center transition-colors ${priority === option.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"} `}>
                <div className="mb-1 text-lg">{option.icon}</div>
                <div className="text-xs font-medium">{option.label}</div>
              </button>))}
          </div>
        </div>

        {/* File Attachments */}
        <div>
          <label_1.Label className="mb-2 block text-base font-medium">
            Attachments (Optional)
          </label_1.Label>
          <div className="space-y-3">
            <div>
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileChange} disabled={disabled} className="hidden" id="file-upload"/>
              <button_1.Button variant="outline" asChild disabled={disabled}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <lucide_react_1.Paperclip className="mr-2 h-4 w-4"/>
                  Add Files
                </label>
              </button_1.Button>
              <p className="text-muted-foreground mt-1 text-xs">
                Max 10MB per file. Images, PDFs, and documents only.
              </p>
            </div>

            {attachments.length > 0 && (<div className="space-y-2">
                {attachments.map((file, index) => (<div key={index} className="flex items-center justify-between rounded border bg-gray-50 p-2">
                    <div className="flex items-center gap-2">
                      {file.type.startsWith("image/") ? (<lucide_react_1.Image className="h-4 w-4 text-blue-500"/>) : (<lucide_react_1.FileText className="h-4 w-4 text-gray-500"/>)}
                      <div>
                        <div className="text-sm font-medium">{file.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <button_1.Button type="button" size="sm" variant="ghost" onClick={() => removeAttachment(index)} disabled={disabled}>
                      <lucide_react_1.X className="h-4 w-4 text-red-500"/>
                    </button_1.Button>
                  </div>))}
              </div>)}
          </div>
        </div>

        {/* Submit Button */}
        <div className="border-t pt-4">
          <button_1.Button onClick={handleSubmit} disabled={isSubmitDisabled} size="lg" className="w-full">
            <lucide_react_1.Send className="mr-2 h-5 w-5"/>
            {submitting ? "Submitting Feedback..." : "Submit Feedback"}
          </button_1.Button>

          {selectedPriority && priority !== "normal" && (<div className={`mt-3 rounded-lg p-3 ${selectedPriority.color}`}>
              <div className="flex items-center gap-2">
                {priority === "urgent" && <lucide_react_1.AlertTriangle className="h-4 w-4"/>}
                <span className="text-sm font-medium">
                  {priority === "high" &&
                "High priority feedback will be reviewed within 4 hours"}
                  {priority === "urgent" &&
                "Urgent feedback will be reviewed immediately"}
                  {priority === "low" &&
                "Low priority feedback will be reviewed within 24 hours"}
                </span>
              </div>
            </div>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
