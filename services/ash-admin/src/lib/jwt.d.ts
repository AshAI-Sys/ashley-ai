export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    workspaceId: string;
    iat?: number;
    exp?: number;
}
export declare function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
export declare function verifyToken(token: string): JWTPayload | null;
export declare function refreshToken(token: string): string | null;
