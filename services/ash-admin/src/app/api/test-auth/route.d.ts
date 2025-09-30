import { NextRequest } from 'next/server';
export declare const POST: (request: NextRequest) => Promise<import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<any>> | import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<{
    access_token: string;
    user: {
        userId: string;
        email: string;
        role: string;
        workspaceId: string;
    };
    tokenType: string;
    expiresIn: string;
}>>>;
export declare const GET: (request: NextRequest) => Promise<import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<any>> | import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<{
    valid: boolean;
    payload: import("../../../lib/jwt").JWTPayload;
    message: string;
}>>>;
