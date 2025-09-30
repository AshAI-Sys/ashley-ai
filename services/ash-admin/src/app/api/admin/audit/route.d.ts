import { NextRequest, NextResponse } from 'next/server';
export declare const GET: (request: NextRequest) => Promise<NextResponse<unknown>>;
export declare const POST: (request: NextRequest) => Promise<NextResponse<unknown>>;
export declare function createAuditLog(performer_user_id: string, action: string, description: string, metadata?: any, target_user_id?: string, target_user_email?: string, severity?: 'low' | 'medium' | 'high' | 'critical'): Promise<boolean>;
