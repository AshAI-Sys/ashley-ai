"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorAlert = ErrorAlert;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const alert_1 = require("./alert");
const button_1 = require("./button");
function ErrorAlert({ title = "Error", message, retry, }) {
    return (<alert_1.Alert variant="destructive" className="mb-6">
      <lucide_react_1.AlertCircle className="h-4 w-4"/>
      <alert_1.AlertTitle>{title}</alert_1.AlertTitle>
      <alert_1.AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {retry && (<button_1.Button variant="outline" size="sm" onClick={retry} className="ml-4">
            <lucide_react_1.RefreshCw className="mr-2 h-4 w-4"/>
            Retry
          </button_1.Button>)}
      </alert_1.AlertDescription>
    </alert_1.Alert>);
}
