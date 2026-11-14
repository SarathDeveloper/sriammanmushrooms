import { NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse } from "@/lib/api-utils";
import { indianMobileError, normalizeIndianMobile } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

const preOrderSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80, "Name is too long"),
  phone: z.string().trim().min(1, "Phone number is required").max(20),
  email: z.string().trim().email("Invalid email address").max(120),
  product: z.string().trim().min(1, "Please specify a product").max(120),
  quantity: z.string().trim().min(1, "Please specify a quantity").max(40),
  preferredDate: z.string().trim().min(1, "Please choose a preferred date").max(40),
  location: z.string().trim().min(2, "Location is required").max(120),
  notes: z.string().trim().max(1000, "Notes are too long").optional(),
  // Honeypot: hidden from people, so only bots fill it.
  website: z.string().optional(),
});

// 5 pre-orders per 10 minutes per IP is plenty for a real visitor.
const PRE_ORDER_LIMIT = 5;
const PRE_ORDER_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  return withRateLimit(request, () => handlePreOrder(request), {
    limit: PRE_ORDER_LIMIT,
    windowMs: PRE_ORDER_WINDOW_MS,
    identifier: "pre-order",
  });
}

async function handlePreOrder(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const parsed = preOrderSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
  }

  const { website, ...data } = parsed.data;
  if (website?.trim()) {
    // Pretend success so bots don't retry.
    return NextResponse.json({ message: "Pre-order submitted successfully." }, { status: 201 });
  }

  const phone = normalizeIndianMobile(data.phone);
  const phoneErr = indianMobileError(phone);
  if (phoneErr) {
    return errorResponse(phoneErr, 400);
  }

  try {
    const preOrder = await prisma.preOrder.create({ data: { ...data, phone } });
    return NextResponse.json(
      { message: "Pre-order submitted successfully.", id: preOrder.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Pre-order submission error:", error);
    return errorResponse("We couldn't submit your pre-order right now. Please try again or WhatsApp us.", 500);
  }
}
