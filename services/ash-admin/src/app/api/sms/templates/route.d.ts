import { NextResponse } from "next/server";
export declare function GET(): Promise<NextResponse<{
    success: boolean;
    templates: any[];
    count: number;
}> | NextResponse<{
    error: string;
    details: any;
}>>;
