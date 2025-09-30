import { Request, Response, NextFunction } from 'express';
export declare function validateWorkspace(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
