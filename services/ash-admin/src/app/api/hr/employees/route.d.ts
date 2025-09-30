import { NextRequest, NextResponse } from 'next/server';
export declare const GET: (request: NextRequest) => Promise<NextResponse<unknown>>;
export declare const POST: (request: NextRequest) => Promise<NextResponse<unknown>>;
export declare const PUT: (request: NextRequest) => Promise<NextResponse<import("../../../../lib/error-handling").ApiResponse<any>> | NextResponse<import("../../../../lib/error-handling").ApiResponse<any>>>;
