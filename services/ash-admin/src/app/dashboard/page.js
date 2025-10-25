"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardPage;
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const RoleSpecificDashboard_1 = __importDefault(require("@/components/role-dashboards/RoleSpecificDashboard"));
function DashboardPage() {
    return (<dashboard_layout_1.default>
      <RoleSpecificDashboard_1.default />
    </dashboard_layout_1.default>);
}
