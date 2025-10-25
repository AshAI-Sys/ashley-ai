import { NextResponse } from "next/server";
export declare function GET(): Promise<NextResponse<{
    message: string;
}>>;
export declare function POST(): Promise<NextResponse<{
    success: boolean;
    message: string;
}> | NextResponse<{
    success: boolean;
    error: any;
    stack: any;
}>>;
