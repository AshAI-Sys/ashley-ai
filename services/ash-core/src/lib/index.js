"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = exports.notificationService = exports.EmailService = exports.emailService = void 0;
var emailService_1 = require("./email/emailService");
Object.defineProperty(exports, "emailService", { enumerable: true, get: function () { return emailService_1.emailService; } });
Object.defineProperty(exports, "EmailService", { enumerable: true, get: function () { return emailService_1.EmailService; } });
var notificationService_1 = require("./notifications/notificationService");
Object.defineProperty(exports, "notificationService", { enumerable: true, get: function () { return notificationService_1.notificationService; } });
Object.defineProperty(exports, "NotificationService", { enumerable: true, get: function () { return notificationService_1.NotificationService; } });
