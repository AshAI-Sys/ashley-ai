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
exports.AshleyAlert = void 0;
const React = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("../../lib/utils");
const badge_1 = require("../badge");
const riskConfig = {
    GREEN: {
        icon: lucide_react_1.CheckCircle,
        badgeVariant: "success",
        bgColor: "bg-ash-green-50 border-ash-green-200",
        textColor: "text-ash-green-800",
        iconColor: "text-ash-green-600",
    },
    AMBER: {
        icon: lucide_react_1.AlertTriangle,
        badgeVariant: "warning",
        bgColor: "bg-ash-orange-50 border-ash-orange-200",
        textColor: "text-ash-orange-800",
        iconColor: "text-ash-orange-600",
    },
    RED: {
        icon: lucide_react_1.XCircle,
        badgeVariant: "destructive",
        bgColor: "bg-red-50 border-red-200",
        textColor: "text-red-800",
        iconColor: "text-red-600",
    },
};
const AshleyAlert = React.forwardRef(({ className, risk, issues = [], recommendations = [], confidence = 0, showDetails = true, ...props }, ref) => {
    const config = riskConfig[risk];
    const Icon = config.icon;
    return (<div ref={ref} className={(0, utils_1.cn)("rounded-lg border p-4", config.bgColor, className)} {...props}>
        <div className="flex items-start gap-3">
          <Icon className={(0, utils_1.cn)("h-5 w-5 mt-0.5", config.iconColor)}/>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className={(0, utils_1.cn)("font-semibold", config.textColor)}>
                Ashley AI Analysis
              </h4>
              <div className="flex items-center gap-2">
                <badge_1.Badge variant={config.badgeVariant}>
                  {risk}
                </badge_1.Badge>
                {confidence > 0 && (<span className="text-xs text-muted-foreground">
                    {Math.round(confidence * 100)}% confidence
                  </span>)}
              </div>
            </div>

            {showDetails && (<>
                {issues.length > 0 && (<div className="space-y-2">
                    <h5 className={(0, utils_1.cn)("text-sm font-medium", config.textColor)}>
                      Issues Detected:
                    </h5>
                    <ul className="space-y-1">
                      {issues.map((issue, index) => (<li key={index} className={(0, utils_1.cn)("text-sm flex items-start gap-2", config.textColor)}>
                          <span className="inline-block w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0"/>
                          <div>
                            <span className="font-medium">{issue.type}:</span>{" "}
                            {issue.message}
                            {issue.details && (<div className="mt-1 text-xs opacity-75">
                                {Object.entries(issue.details).map(([key, value]) => (<span key={key} className="block">
                                    {key}: {String(value)}
                                  </span>))}
                              </div>)}
                          </div>
                        </li>))}
                    </ul>
                  </div>)}

                {recommendations.length > 0 && (<div className="space-y-2">
                    <h5 className={(0, utils_1.cn)("text-sm font-medium", config.textColor)}>
                      Recommendations:
                    </h5>
                    <ul className="space-y-1">
                      {recommendations.map((recommendation, index) => (<li key={index} className={(0, utils_1.cn)("text-sm flex items-start gap-2", config.textColor)}>
                          <lucide_react_1.Info className="w-3 h-3 mt-0.5 flex-shrink-0"/>
                          {recommendation}
                        </li>))}
                    </ul>
                  </div>)}
              </>)}
          </div>
        </div>
      </div>);
});
exports.AshleyAlert = AshleyAlert;
AshleyAlert.displayName = "AshleyAlert";
