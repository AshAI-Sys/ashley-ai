import { NextResponse } from "next/server";
export declare const POST: any;
export declare function GET(): Promise<NextResponse<{
    providers: any;
    balances: any;
    configured: boolean;
}> | NextResponse<{
    error: string;
    details: any;
}>>;
