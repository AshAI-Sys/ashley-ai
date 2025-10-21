"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  event_type: string;
  title: string;
  description?: string;
  performed_by?: string;
  created_at: string;
  metadata?: any;
}

interface ActivityTimelineProps {
  activities: ActivityLog[];
  loading?: boolean;
}

const EVENT_TYPE_CONFIG: Record<
  string,
  { icon: any; color: string; bgColor: string }
> = {
  CREATED: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  STATUS_CHANGED: {
    icon: ArrowRight,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  TRANSFERRED: {
    icon: ArrowRight,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  APPROVED: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  UPDATED: {
    icon: Info,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  REJECTED: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  COMMENT_ADDED: {
    icon: Info,
    color: "text-gray-300",
    bgColor: "bg-gray-100",
  },
  FILE_UPLOADED: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  DEFAULT: {
    icon: Info,
    color: "text-gray-300",
    bgColor: "bg-gray-100",
  },
};

function getEventConfig(eventType: string) {
  return EVENT_TYPE_CONFIG[eventType] || EVENT_TYPE_CONFIG.DEFAULT;
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return timestamp;
  }
}

export function ActivityTimeline({
  activities,
  loading = false,
}: ActivityTimelineProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            Loading activities...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            No activity yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
          <Badge variant="outline">{activities.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-gray-200" />

          {/* Timeline Items */}
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const config = getEventConfig(activity.event_type);
              const Icon = config.icon;

              return (
                <div key={activity.id} className="relative pl-12">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute left-0 h-8 w-8 rounded-full ${config.bgColor} flex items-center justify-center`}
                  >
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>

                  {/* Activity Content */}
                  <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-medium text-gray-900">
                        {activity.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {activity.event_type.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    {activity.description && (
                      <p className="mb-3 text-sm text-gray-600">
                        {activity.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {activity.performed_by && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{activity.performed_by}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(activity.created_at)}</span>
                      </div>
                    </div>

                    {/* Metadata (if any) */}
                    {activity.metadata &&
                      Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-3 border-t pt-3">
                          <div className="space-y-1 text-xs text-gray-500">
                            {Object.entries(activity.metadata).map(
                              ([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="font-medium capitalize">
                                    {key.replace(/_/g, " ")}:
                                  </span>
                                  <span>{String(value)}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Load More (if needed in future) */}
        {activities.length >= 10 && (
          <div className="mt-6 text-center">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Load more activities
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
