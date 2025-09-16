"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard-controller");
const auth_1 = require("../middleware/auth");
const workspace_1 = require("../middleware/workspace");
const router = (0, express_1.Router)();
exports.dashboardRouter = router;
const dashboardController = new dashboard_controller_1.DashboardController();
// Apply authentication and workspace validation to all dashboard routes
router.use(auth_1.authMiddleware);
router.use(workspace_1.validateWorkspace);
// Real-time production dashboard routes
router.get('/overview', dashboardController.getProductionOverview.bind(dashboardController));
router.get('/floor-status', dashboardController.getProductionFloorStatus.bind(dashboardController));
router.get('/analytics', dashboardController.getAdvancedAnalytics.bind(dashboardController));
