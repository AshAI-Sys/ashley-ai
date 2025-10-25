"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EfficiencyGaugeChart;
const defaultData = [{ department: "Cutting", efficiency: 87, target: 90, color: "#3B82F6" }, { department: "Printing", efficiency: 92, target: 90, color: "#10B981" }, { department: "Sewing", efficiency: 78, target: 85, color: "#F59E0B" }, { department: "Finishing", efficiency: 95, target: 90, color: "#8B5CF6" },
];
function EfficiencyGaugeChart({ data = defaultData, title = "Efficiency by Department", description = "Real-time efficiency tracking across production stages", }) {
}
