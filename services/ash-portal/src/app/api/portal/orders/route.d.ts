import { NextRequest, NextResponse } from "next/server";
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    orders: {
        id: string;
        order_number: string;
        status: string;
        total_amount: number;
        currency: string;
        delivery_date: Date;
        created_at: Date;
        updated_at: Date;
        brand: {
            id: string;
            workspace_id: string;
            created_at: Date;
            name: string;
            client_id: string;
            code: string | null;
            logo_url: string | null;
            settings: string | null;
            is_active: boolean;
            updated_at: Date;
            deleted_at: Date | null;
        };
        line_items: {
            id: string;
            workspace_id: string;
            created_at: Date;
            updated_at: Date;
            metadata: string | null;
            quantity: number;
            order_id: string;
            description: string;
            printing_method: string | null;
            sku: string | null;
            unit_price: number;
            total_price: number;
            garment_type: string | null;
            size_breakdown: string | null;
        }[];
        progress: {
            percentage: number;
            current_stage: string;
            completed_steps: number;
            total_steps: number;
        };
        payment: {
            status: string;
            total_invoiced: number;
            total_paid: number;
            outstanding: number;
        };
        latest_tracking: any;
        needs_approval: boolean;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>>;
