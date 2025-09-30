import { Request, Response, NextFunction } from 'express';
interface AuthToken {
    userId: string;
    workspaceId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
export interface AuthenticatedRequest extends Request {
    user?: AuthToken;
}
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export {};
