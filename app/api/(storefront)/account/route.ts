import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { errorResponse } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { ORDERS_ENABLED } from "@/lib/features";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!ORDERS_ENABLED) return errorResponse("Not found.", 404);

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return errorResponse("Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      addresses: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      },
      _count: { select: { orders: true } },
    },
  });

  if (!user) {
    return errorResponse("User not found", 404);
  }

  return NextResponse.json({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    memberSince: new Date(user.createdAt).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    }),
    totalOrders: user._count.orders,
    addresses: user.addresses,
  });
}

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export async function PATCH(request: Request) {
  if (!ORDERS_ENABLED) return errorResponse("Not found.", 404);

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return errorResponse("Unauthorized", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body", 400);
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const { name, email } = parsed.data;

  if (email) {
    const existing = await prisma.user.findFirst({
      where: { email, id: { not: session.user.id } },
    });
    if (existing) {
      return errorResponse("This email is already in use by another account", 409);
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
    },
    select: { name: true, email: true, phone: true },
  });

  return NextResponse.json(updated);
}
