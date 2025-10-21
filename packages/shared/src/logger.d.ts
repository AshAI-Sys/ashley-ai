import winston from "winston";
export declare const logger: winston.Logger;
export declare const logRequest: (req: any, res: any, duration: number) => void;
export declare const logError: (error: Error, context?: any) => void;
export declare const logAuditEvent: (event: {
  action: string;
  resource: string;
  resourceId: string;
  userId?: string;
  workspaceId: string;
  details?: any;
}) => void;
