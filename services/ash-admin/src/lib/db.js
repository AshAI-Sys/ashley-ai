"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaRaw = exports.prisma = void 0;
const database_1 = require("@/lib/database");
// import { performanceExtension, queryLoggingExtension, autoPaginationExtension } from './performance/prisma-extensions'
// Export Prisma client directly (extensions temporarily disabled for stability)
exports.prisma = database_1.db;
// Export original client for raw queries
exports.prismaRaw = database_1.db;
