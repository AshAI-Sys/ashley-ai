import type { NextApiRequest, NextApiResponse } from "next";
interface Order {
    order_number: string;
    client: {
        name: string;
    };
    brand?: string;
    status: string;
    total_amount: number;
    delivery_date: string;
    created_at: string;
    line_items: LineItem[];
}
interface LineItem {
    description: string;
    quantity: number;
    garment_type: string;
    printing_method: string;
    size_breakdown?: any;
}
interface TimelineItem {
    stage: string;
    status: string;
    timestamp: string;
    description: string;
    icon: string;
    details?: Record<string, any>;
}
interface TrackingResponse {
    success: boolean;
    data?: {
        order: Order;
        timeline: TimelineItem[];
        current_status: string;
        progress_percentage: number;
        estimated_completion: string;
        real_time_updates: TimelineItem[];
    };
    error?: string;
}
export default function handler(req: NextApiRequest, res: NextApiResponse<TrackingResponse>): Promise<void>;
export {};
