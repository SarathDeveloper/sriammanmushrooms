import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-utils";
import { ORDERS_ENABLED } from "@/lib/features";
import { getDeliveryRule } from "@/lib/order-pricing";

export async function GET(request: Request) {
  if (!ORDERS_ENABLED) return errorResponse("Not found.", 404);

  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get("pincode")?.trim();

  try {
    return NextResponse.json(await getDeliveryRule(pincode));
  } catch (error) {
    console.error("Error fetching delivery charge:", error);
    return NextResponse.json({ charge: 49, minOrderValue: 500 });
  }
}
