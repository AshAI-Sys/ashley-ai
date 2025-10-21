import * as React from "react";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "../badge";

export interface AshleyAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  risk: "GREEN" | "AMBER" | "RED";
  issues?: Array<{
    type: string;
    message: string;
    details?: Record<string, unknown>;
  }>;
  recommendations?: string[];
  confidence?: number;
  showDetails?: boolean;
}

const riskConfig = {
  GREEN: {
    icon: CheckCircle,
    badgeVariant: "success" as const,
    bgColor: "bg-ash-green-50 border-ash-green-200",
    textColor: "text-ash-green-800",
    iconColor: "text-ash-green-600",
  },
  AMBER: {
    icon: AlertTriangle,
    badgeVariant: "warning" as const,
    bgColor: "bg-ash-orange-50 border-ash-orange-200",
    textColor: "text-ash-orange-800",
    iconColor: "text-ash-orange-600",
  },
  RED: {
    icon: XCircle,
    badgeVariant: "destructive" as const,
    bgColor: "bg-red-50 border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-600",
  },
};

const AshleyAlert = React.forwardRef<HTMLDivElement, AshleyAlertProps>(
  (
    {
      className,
      risk,
      issues = [],
      recommendations = [],
      confidence = 0,
      showDetails = true,
      ...props
    },
    ref
  ) => {
    const config = riskConfig[risk];
    const Icon = config.icon;

    return (
      <div
        ref={ref}
        className={cn("rounded-lg border p-4", config.bgColor, className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn("mt-0.5 h-5 w-5", config.iconColor)} />

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className={cn("font-semibold", config.textColor)}>
                Ashley AI Analysis
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant={config.badgeVariant}>{risk}</Badge>
                {confidence > 0 && (
                  <span className="text-muted-foreground text-xs">
                    {Math.round(confidence * 100)}% confidence
                  </span>
                )}
              </div>
            </div>

            {showDetails && (
              <>
                {issues.length > 0 && (
                  <div className="space-y-2">
                    <h5 className={cn("text-sm font-medium", config.textColor)}>
                      Issues Detected:
                    </h5>
                    <ul className="space-y-1">
                      {issues.map((issue, index) => (
                        <li
                          key={index}
                          className={cn(
                            "flex items-start gap-2 text-sm",
                            config.textColor
                          )}
                        >
                          <span className="mt-2 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-current" />
                          <div>
                            <span className="font-medium">{issue.type}:</span>{" "}
                            {issue.message}
                            {issue.details && (
                              <div className="mt-1 text-xs opacity-75">
                                {Object.entries(issue.details).map(
                                  ([key, value]) => (
                                    <span key={key} className="block">
                                      {key}: {String(value)}
                                    </span>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h5 className={cn("text-sm font-medium", config.textColor)}>
                      Recommendations:
                    </h5>
                    <ul className="space-y-1">
                      {recommendations.map((recommendation, index) => (
                        <li
                          key={index}
                          className={cn(
                            "flex items-start gap-2 text-sm",
                            config.textColor
                          )}
                        >
                          <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

AshleyAlert.displayName = "AshleyAlert";

export { AshleyAlert };
