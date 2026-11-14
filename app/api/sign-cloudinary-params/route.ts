import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!secret) {
    console.error("Cloudinary sign failed: CLOUDINARY_API_SECRET is not set");
    return NextResponse.json(
      { error: "Cloudinary is not configured" },
      { status: 500 }
    );
  }

  let body: Record<string, unknown> | null = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Some next-cloudinary versions nest the params under paramsToSign, others
  // send them at the root of the body.
  const paramsToSign =
    (body?.paramsToSign as Record<string, unknown> | undefined) ?? body;

  if (!paramsToSign || Object.keys(paramsToSign).length === 0) {
    return NextResponse.json({ error: "Missing paramsToSign" }, { status: 400 });
  }

  try {
    const signature = cloudinary.utils.api_sign_request(paramsToSign, secret);
    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Cloudinary sign error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to sign parameters" }, { status: 500 });
  }
}
