import winston from "winston";

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(logColors);

// Create logger format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    info =>
      `${info.timestamp} ${info.level}: ${info.message}` +
      (info.splat !== undefined ? `${info.splat}` : " ") +
      (info.stack !== undefined ? `\n${info.stack}` : "")
  )
);

// Create transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    format: logFormat,
  }),

  // File transport for errors
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: "logs/combined.log",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.ASH_LOG_LEVEL || "info",
  levels: logLevels,
  transports,
  // Handle exceptions
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
  // Handle rejections
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" }),
  ],
});

// Create logs directory if it doesn't exist
import { existsSync, mkdirSync } from "fs";
if (!existsSync("logs")) {
  mkdirSync("logs");
}

// Add request logging helper
export const logRequest = (req: any, res: any, duration: number) => {
  logger.http(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    user_id: req.user?.user_id,
    workspace_id: req.user?.workspace_id,
  });
};

// Add error logging helper
export const logError = (error: Error, context?: any) => {
  logger.error(error.message, {
    stack: error.stack,
    context,
  });
};

// Add audit logging helper
export const logAuditEvent = (event: {
  action: string;
  resource: string;
  resourceId: string;
  userId?: string;
  workspaceId: string;
  details?: any;
}) => {
  logger.info("Audit Event", event);
};
