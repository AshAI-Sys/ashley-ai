"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityTimeline = ActivityTimeline;
const react_1 = __importDefault(require("react"));
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
const EVENT_TYPE_CONFIG = {
    CREATED: {
        icon: lucide_react_1.CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
    },
    STATUS_CHANGED: {
        icon: lucide_react_1.ArrowRight,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
    },
    TRANSFERRED: {
        icon: lucide_react_1.ArrowRight,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
    },
    APPROVED: {
        icon: lucide_react_1.CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
    },
    UPDATED: {
        icon: lucide_react_1.Info,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
    },
    REJECTED: {
        icon: lucide_react_1.AlertCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
    },
    COMMENT_ADDED: {
        icon: lucide_react_1.Info,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
    },
    FILE_UPLOADED: {
        icon: lucide_react_1.Info,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
    },
    DEFAULT: {
        icon: lucide_react_1.Info,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
    },
};
function getEventConfig(eventType) {
    return EVENT_TYPE_CONFIG[eventType] || EVENT_TYPE_CONFIG.DEFAULT;
}
function formatTimestamp(timestamp) {
    try {
        const date = new Date(timestamp);
        return (0, date_fns_1.formatDistanceToNow)(date, { addSuffix: true });
    }
    catch (error) {
        return timestamp;
    }
}
function ActivityTimeline({ activities, loading = false, }) {
    if (loading) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Clock className="h-5 w-5"/>
            Activity Timeline
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="py-8 text-center text-muted-foreground">
            Loading activities...
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (!activities || activities.length === 0) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Clock className="h-5 w-5"/>
            Activity Timeline
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="py-8 text-center text-muted-foreground">
            No activity yet
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Clock className="h-5 w-5"/>
          Activity Timeline
          <badge_1.Badge variant="outline">{activities.length}</badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-gray-200"/>

          {/* Timeline Items */}
          <div className="space-y-6">
            {activities.map((activity, index) => {
            const config = getEventConfig(activity.event_type);
            const Icon = config.icon;
            return (<div key={activity.id} className="relative pl-12">
                  {/* Timeline Dot */}
                  <div className={`absolute left-0 h-8 w-8 rounded-full ${config.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${config.color}`}/>
                  </div>

                  {/* Activity Content */}
                  <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-medium text-gray-900">
                        {activity.title}
                      </h4>
                      <badge_1.Badge variant="outline" className="text-xs">
                        {activity.event_type.replace(/_/g, " ")}
                      </badge_1.Badge>
                    </div>

                    {activity.description && (<p className="mb-3 text-sm text-gray-600">
                        {activity.description}
                      </p>)}

                    <div className="flex items-center gap-4 text-xs text-gray-700">
                      {activity.performed_by && (<div className="flex items-center gap-1">
                          <lucide_react_1.User className="h-3 w-3"/>
                          <span>{activity.performed_by}</span>
                        </div>)}
                      <div className="flex items-center gap-1">
                        <lucide_react_1.Clock className="h-3 w-3"/>
                        <span>{formatTimestamp(activity.created_at)}</span>
                      </div>
                    </div>

                    {/* Metadata (if any) */}
                    {activity.metadata &&
                    Object.keys(activity.metadata).length > 0 && (<div className="mt-3 border-t pt-3">
                          <div className="space-y-1 text-xs text-gray-700">
                            {Object.entries(activity.metadata).map(([key, value]) => (<div key={key} className="flex gap-2">
                                  <span className="font-medium capitalize">
                                    {key.replace(/_/g, " ")}:
                                  </span>
                                  <span>{String(value)}</span>
                                </div>))}
                          </div>
                        </div>)}
                  </div>
                </div>);
        })}
          </div>
        </div>

        {/* Load More (if needed in future) */}
        {activities.length >= 10 && (<div className="mt-6 text-center">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Load more activities
            </button>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
