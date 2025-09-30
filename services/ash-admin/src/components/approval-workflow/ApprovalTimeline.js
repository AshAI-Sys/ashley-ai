'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalTimeline = ApprovalTimeline;
const react_1 = __importDefault(require("react"));
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
function ApprovalTimeline({ events, className = '' }) {
    const getEventConfig = (type) => {
        switch (type) {
            case 'sent':
                return {
                    icon: lucide_react_1.Send,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    title: 'Approval Request Sent'
                };
            case 'approved':
                return {
                    icon: lucide_react_1.CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                    title: 'Design Approved'
                };
            case 'changes_requested':
                return {
                    icon: lucide_react_1.MessageCircle,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-100',
                    title: 'Changes Requested'
                };
            case 'expired':
                return {
                    icon: lucide_react_1.AlertCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100',
                    title: 'Approval Expired'
                };
            case 'reminded':
                return {
                    icon: lucide_react_1.Clock,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    title: 'Reminder Sent'
                };
            default:
                return {
                    icon: lucide_react_1.Clock,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    title: 'Event'
                };
        }
    };
    if (events.length === 0) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Clock className="w-5 h-5"/>
            Approval Timeline
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <p className="text-muted-foreground text-center py-4">
            No approval activity yet
          </p>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Clock className="w-5 h-5"/>
          Approval Timeline
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200"/>
          
          <div className="space-y-6">
            {events
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((event, index) => {
            const config = getEventConfig(event.type);
            const Icon = config.icon;
            const isLast = index === events.length - 1;
            return (<div key={event.id} className="relative flex items-start gap-4">
                    {/* Icon */}
                    <div className={`
                      relative z-10 flex items-center justify-center w-12 h-12 rounded-full
                      ${config.bgColor} ${config.color}
                    `}>
                      <Icon className="w-5 h-5"/>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {config.title}
                            {event.version && (<badge_1.Badge variant="outline" className="ml-2">
                                v{event.version}
                              </badge_1.Badge>)}
                          </h4>
                          
                          {event.actor && (<div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                              <lucide_react_1.User className="w-3 h-3"/>
                              <span>{event.actor}</span>
                              {event.actor_type && (<badge_1.Badge variant="secondary" className="text-xs">
                                  {event.actor_type}
                                </badge_1.Badge>)}
                            </div>)}

                          {event.details && (<p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                              {event.details}
                            </p>)}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-500 ml-4">
                          <lucide_react_1.Calendar className="w-3 h-3"/>
                          {new Date(event.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                        </div>
                      </div>
                    </div>
                  </div>);
        })}
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
