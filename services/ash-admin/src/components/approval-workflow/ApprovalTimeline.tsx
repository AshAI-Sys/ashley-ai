"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApprovalStatus } from "./ApprovalStatus";
import {
  Send,
  Clock,
  CheckCircle,
  MessageCircle,
  AlertCircle,
  User,
  Calendar,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "sent" | "approved" | "changes_requested" | "expired" | "reminded";
  timestamp: string;
  actor?: string;
  actor_type?: "employee" | "client";
  details?: string;
  version?: number;
}

interface ApprovalTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function ApprovalTimeline({
  events,
  className = "",
}: ApprovalTimelineProps) {
  const getEventConfig = (type: string) => {
    switch (type) {
      case "sent":
        return {
          icon: Send,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          title: "Approval Request Sent",
        };
      case "approved":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-100",
          title: "Design Approved",
        };
      case "changes_requested":
        return {
          icon: MessageCircle,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          title: "Changes Requested",
        };
      case "expired":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          bgColor: "bg-red-100",
          title: "Approval Expired",
        };
      case "reminded":
        return {
          icon: Clock,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          title: "Reminder Sent",
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          title: "Event",
        };
    }
  };

  if (events.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Approval Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-muted-foreground">
            No approval activity yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Approval Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute bottom-0 left-6 top-0 w-px bg-gray-200" />

          <div className="space-y-6">
            {events
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .map((event, index) => {
                const config = getEventConfig(event.type);
                const Icon = config.icon;
                const _isLast = index === events.length - 1;

                return (
                  <div
                    key={event.id}
                    className="relative flex items-start gap-4"
                  >
                    {/* Icon */}
                    <div
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${config.bgColor} ${config.color} `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pb-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {config.title}
                            {event.version && (
                              <Badge variant="outline" className="ml-2">
                                v{event.version}
                              </Badge>
                            )}
                          </h4>

                          {event.actor && (
                            <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                              <User className="h-3 w-3" />
                              <span>{event.actor}</span>
                              {event.actor_type && (
                                <Badge variant="secondary" className="text-xs">
                                  {event.actor_type}
                                </Badge>
                              )}
                            </div>
                          )}

                          {event.details && (
                            <p className="mt-2 rounded bg-gray-50 p-3 text-sm text-gray-600">
                              {event.details}
                            </p>
                          )}
                        </div>

                        <div className="ml-4 flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
