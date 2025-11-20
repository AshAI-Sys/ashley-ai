import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';

export const GET = requireAuth(async (req: NextRequest, user) => {
  const templates = [
    { id: "1", name: "Order Confirmation", message: "Hi NAME, your order NUMBER is confirmed!", variables: ["name", "order_number"] },
    { id: "2", name: "Delivery Update", message: "Your order NUMBER is out for delivery!", variables: ["order_number"] },
    { id: "3", name: "Payment Reminder", message: "Payment of AMOUNT is due for order NUMBER", variables: ["amount", "order_number"] }
  ];
  return NextResponse.json({ success: true, templates });
});

export const POST = requireAuth(async (req: NextRequest, user) => {
  try {
    const { template_id, variables } = await req.json();
    return NextResponse.json({ success: true, template: { preview: "Preview text here" } });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to preview template" }, { status: 500 });
  }
});
