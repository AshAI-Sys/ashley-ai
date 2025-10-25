"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyState = EmptyState;
const react_1 = __importDefault(require("react"));
const button_1 = require("./button");
const card_1 = require("./card");
const hydration_safe_icon_1 = __importDefault(require("@/components/hydration-safe-icon"));
function EmptyState({ icon: Icon, title, description, action, }) {
    return (<card_1.Card>
      <card_1.CardContent className="py-12 text-center">
        <hydration_safe_icon_1.default Icon={Icon} className="mx-auto mb-4 h-12 w-12 text-gray-500"/>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        {description && (<p className="mb-4 text-muted-foreground">{description}</p>)}
        {action && <button_1.Button onClick={action.onClick}>{action.label}</button_1.Button>}
      </card_1.CardContent>
    </card_1.Card>);
}
