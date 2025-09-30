import { Request, Response } from 'express';
export declare class DashboardController {
    getProductionOverview(req: Request, res: Response): Promise<void>;
    getProductionFloorStatus(req: Request, res: Response): Promise<void>;
    getAdvancedAnalytics(req: Request, res: Response): Promise<void>;
    private formatDashboardResponse;
    private formatProductionFloorResponse;
}
