import { NextResponse } from "next/server";

export function errorResponse(message: string, status: number = 400, data: Record<string, unknown> = {}) {
  return NextResponse.json({ message, ...data }, { status });
}
