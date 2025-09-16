import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare const createCutLay: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createBundlesFromCutting: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createPrintRun: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const processPrintingBundles: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const startSewingOperation: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const completeSewingOperation: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const generateBundleQR: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
