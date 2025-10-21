"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditEvent =
  exports.logError =
  exports.logRequest =
  exports.logger =
    void 0;
const winston_1 = __importDefault(require("winston"));
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
winston_1.default.addColors(logColors);
// Create logger format
const logFormat = winston_1.default.format.combine(
  winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston_1.default.format.colorize({ all: true }),
  winston_1.default.format.printf(
    info =>
      `${info.timestamp} ${info.level}: ${info.message}` +
      (info.splat !== undefined ? `${info.splat}` : " ") +
      (info.stack !== undefined ? `\n${info.stack}` : "")
  )
);
// Create transports
const transports = [
  // Console transport for development
  new winston_1.default.transports.Console({
    format: logFormat,
  }),
  // File transport for errors
  new winston_1.default.transports.File({
    filename: "logs/error.log",
    level: "error",
    format: winston_1.default.format.combine(
      winston_1.default.format.timestamp(),
      winston_1.default.format.json()
    ),
  }),
  // File transport for all logs
  new winston_1.default.transports.File({
    filename: "logs/combined.log",
    format: winston_1.default.format.combine(
      winston_1.default.format.timestamp(),
      winston_1.default.format.json()
    ),
  }),
];
// Create logger instance
exports.logger = winston_1.default.createLogger({
  level: process.env.ASH_LOG_LEVEL || "info",
  levels: logLevels,
  transports,
  // Handle exceptions
  exceptionHandlers: [
    new winston_1.default.transports.File({ filename: "logs/exceptions.log" }),
  ],
  // Handle rejections
  rejectionHandlers: [
    new winston_1.default.transports.File({ filename: "logs/rejections.log" }),
  ],
});
// Create logs directory if it doesn't exist
const fs_1 = require("fs");
if (!(0, fs_1.existsSync)("logs")) {
  (0, fs_1.mkdirSync)("logs");
}
// Add request logging helper
const logRequest = (req, res, duration) => {
  exports.logger.http(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    user_id: req.user?.user_id,
    workspace_id: req.user?.workspace_id,
  });
};
exports.logRequest = logRequest;
// Add error logging helper
const logError = (error, context) => {
  exports.logger.error(error.message, {
    stack: error.stack,
    context,
  });
};
exports.logError = logError;
// Add audit logging helper
const logAuditEvent = event => {
  exports.logger.info("Audit Event", event);
};
exports.logAuditEvent = logAuditEvent;
