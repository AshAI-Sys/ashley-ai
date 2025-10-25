import { NextResponse } from "next/server";
export declare const POST: any;
export declare function GET(): Promise<NextResponse<{
    success: boolean;
    data: any;
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
