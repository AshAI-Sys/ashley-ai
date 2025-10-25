"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalStatusTracker = ApprovalStatusTracker;
const react_1 = __importDefault(require("react"));
const card_1 = require("@ash-ai/ui/card");
const badge_1 = require("@ash-ai/ui/badge");
const progress_1 = require("@ash-ai/ui/progress");
const lucide_react_1 = require("lucide-react");
const DEFAULT_STEPS = [
    {
        id: "sent",
        title: "Request Sent",
        status: "completed",
        description: "Approval request was sent to you",
    },
    {
        id: "review",
        title: "Under Review",
        status: "current",
        description: "Waiting for your feedback",
    },
    {
        id: "decision",
        title: "Decision Made",
        status: "pending",
        description: "Approval or changes requested",
    },
    {
        id: "production",
        title: "Ready for Production",
        status: "pending",
        description: "Design approved and ready",
    },
];
function ApprovalStatusTracker({ currentStatus, approvalDate, expiryDate, approverName, timeRemaining, steps = DEFAULT_STEPS, className = "", }) {
    const getStatusConfig = (status) => {
        switch (status.toUpperCase()) {
            case "SENT":
                return {
                    label: "Awaiting Your Review",
                    color: "text-blue-600",
                    bgColor: "bg-blue-50 border-blue-200",
                    icon: lucide_react_1.Clock,
                    progress: 25,
                };
            case "APPROVED":
                return {
                    label: "Approved - Thank You!",
                    color: "text-green-600",
                    bgColor: "bg-green-50 border-green-200",
                    icon: lucide_react_1.CheckCircle,
                    progress: 100,
                };
            case "CHANGES_REQUESTED":
                return {
                    label: "Feedback Submitted",
                    color: "text-yellow-600",
                    bgColor: "bg-yellow-50 border-yellow-200",
                    icon: lucide_react_1.MessageCircle,
                    progress: 75,
                };
            case "EXPIRED":
                return {
                    label: "Request Expired",
                    color: "text-red-600",
                    bgColor: "bg-red-50 border-red-200",
                    icon: lucide_react_1.AlertCircle,
                    progress: 0,
                };
            default:
                return {
                    label: "Pending Review",
                    color: "text-gray-600",
                    bgColor: "bg-gray-50 border-gray-200",
                    icon: lucide_react_1.Clock,
                    progress: 0,
                };
        }
    };
    const config = getStatusConfig(currentStatus);
    const StatusIcon = config.icon;
    const isExpiring = expiryDate &&
        timeRemaining &&
        !currentStatus.includes("APPROVED") &&
        !currentStatus.includes("EXPIRED");
    const isExpired = currentStatus.toUpperCase() === "EXPIRED";
    const isCompleted = ["APPROVED", "CHANGES_REQUESTED"].includes(currentStatus.toUpperCase());
    return (<div className={`space-y-4 ${className}`}>
      {/* Main Status Card */}
      <card_1.Card className={`border-2 ${config.bgColor}`}>
        <card_1.CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <card_1.CardTitle className={`flex items-center gap-2 ${config.color}`}>
              <StatusIcon className="h-5 w-5"/>
              {config.label}
            </card_1.CardTitle>
            <badge_1.Badge variant="secondary" className={`${config.color.replace("text-", "bg-").replace("-600", "-100")} border-current`}>
              {currentStatus?.replace("_", " ") || "Unknown"}
            </badge_1.Badge>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{config.progress}%</span>
            </div>
            <progress_1.Progress value={config.progress} className="h-2"/>
          </div>

          {/* Status Details */}
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            {approvalDate && (<div className="flex items-center gap-2">
                <lucide_react_1.Calendar className="text-muted-foreground h-4 w-4"/>
                <span className="text-muted-foreground">Sent:</span>
                <span className="font-medium">
                  {new Date(approvalDate).toLocaleDateString()}
                </span>
              </div>)}

            {expiryDate && !isCompleted && (<div className={`flex items-center gap-2 ${isExpired ? "text-red-600" : isExpiring ? "text-yellow-600" : ""}`}>
                <lucide_react_1.Clock className="h-4 w-4"/>
                <span>Expires:</span>
                <span className="font-medium">
                  {new Date(expiryDate).toLocaleDateString()}
                </span>
              </div>)}

            {approverName && (<div className="flex items-center gap-2">
                <lucide_react_1.User className="text-muted-foreground h-4 w-4"/>
                <span className="text-muted-foreground">Reviewer:</span>
                <span className="font-medium">{approverName}</span>
              </div>)}

            {timeRemaining && !isCompleted && (<div className={`flex items-center gap-2 ${isExpiring ? "font-medium text-yellow-600" : ""}`}>
                <lucide_react_1.History className="h-4 w-4"/>
                <span>Time remaining:</span>
                <span className="font-medium">{timeRemaining}</span>
              </div>)}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Process Steps */}
      <card_1.Card>
        <card_1.CardHeader className="pb-3">
          <card_1.CardTitle className="flex items-center gap-2 text-lg">
            <lucide_react_1.ArrowRight className="h-5 w-5"/>
            Approval Process
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const StepIcon = step.status === "completed"
                ? lucide_react_1.CheckCircle
                : step.status === "current"
                    ? lucide_react_1.Clock
                    : lucide_react_1.AlertCircle;
            return (<div key={step.id} className="relative">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step.status === "completed"
                    ? "border-green-500 bg-green-100 text-green-600"
                    : step.status === "current"
                        ? "border-blue-500 bg-blue-100 text-blue-600"
                        : "border-gray-300 bg-gray-100 text-gray-400"} `}>
                      <StepIcon className="h-5 w-5"/>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pb-6">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${step.status === "completed"
                    ? "text-green-800"
                    : step.status === "current"
                        ? "text-blue-800"
                        : "text-gray-500"}`}>
                          {step.title}
                        </h4>
                        {step.timestamp && (<span className="text-muted-foreground text-xs">
                            {new Date(step.timestamp).toLocaleString()}
                          </span>)}
                      </div>
                      {step.description && (<p className="text-muted-foreground mt-1 text-sm">
                          {step.description}
                        </p>)}
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (<div className={`absolute left-5 top-10 h-6 w-px ${step.status === "completed" ? "bg-green-300" : "bg-gray-300"} `}/>)}
                </div>);
        })}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Time Warning */}
      {isExpiring && !isExpired && (<card_1.Card className="border-yellow-200 bg-yellow-50">
          <card_1.CardContent className="py-4">
            <div className="flex items-center gap-3">
              <lucide_react_1.AlertCircle className="h-5 w-5 text-yellow-600"/>
              <div>
                <p className="font-medium text-yellow-800">Action Required</p>
                <p className="text-sm text-yellow-700">
                  This approval request expires in {timeRemaining}. Please
                  review and provide your feedback as soon as possible.
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Expired Warning */}
      {isExpired && (<card_1.Card className="border-red-200 bg-red-50">
          <card_1.CardContent className="py-4">
            <div className="flex items-center gap-3">
              <lucide_react_1.AlertCircle className="h-5 w-5 text-red-600"/>
              <div>
                <p className="font-medium text-red-800">Request Expired</p>
                <p className="text-sm text-red-700">
                  This approval request has expired. Please contact us if you
                  still need to provide feedback.
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Success Message */}
      {currentStatus.toUpperCase() === "APPROVED" && (<card_1.Card className="border-green-200 bg-green-50">
          <card_1.CardContent className="py-4">
            <div className="flex items-center gap-3">
              <lucide_react_1.CheckCircle className="h-5 w-5 text-green-600"/>
              <div>
                <p className="font-medium text-green-800">Thank You!</p>
                <p className="text-sm text-green-700">
                  Your approval has been recorded. Your design will now proceed
                  to production.
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Feedback Submitted */}
      {currentStatus.toUpperCase() === "CHANGES_REQUESTED" && (<card_1.Card className="border-blue-200 bg-blue-50">
          <card_1.CardContent className="py-4">
            <div className="flex items-center gap-3">
              <lucide_react_1.MessageCircle className="h-5 w-5 text-blue-600"/>
              <div>
                <p className="font-medium text-blue-800">Feedback Submitted</p>
                <p className="text-sm text-blue-700">
                  Thank you for your feedback! Our team will review your
                  comments and get back to you with an updated design.
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
