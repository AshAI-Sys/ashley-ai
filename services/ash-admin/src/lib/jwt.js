"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.refreshToken = refreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const JWT_SECRET = process.env.JWT_SECRET || crypto_1.default.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: 'HS256'
    });
}
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET, {
            algorithms: ['HS256']
        });
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            console.warn('Invalid JWT token:', error.message);
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            console.warn('JWT token expired:', error.message);
        }
        else {
            console.error('JWT verification error:', error);
        }
        return null;
    }
}
function refreshToken(token) {
    const payload = verifyToken(token);
    if (!payload) {
        return null;
    }
    const { iat, exp, ...tokenData } = payload;
    return generateToken(tokenData);
}
