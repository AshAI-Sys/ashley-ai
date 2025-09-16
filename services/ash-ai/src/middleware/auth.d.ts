import { Request, Response, NextFunction } from 'express';
interface AuthenticatedUser {
    id: string;
    workspace_id: string;
    email: string;
    role: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
            workspace?: any;
        }
    }
}
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
export {};
