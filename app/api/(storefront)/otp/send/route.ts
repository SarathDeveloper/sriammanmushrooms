import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { errorResponse } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { ORDERS_ENABLED } from "@/lib/features";
import { createAndStoreOtp, sendOtpSms } from "@/lib/otp";
import { indianMobileError, normalizeIndianMobile } from "@/lib/phone";
import { consumeRateLimit, withRateLimit, apiLimits } from "@/lib/rate-limit";

// Every OTP is a paid SMS, so cap per number as well as per IP: someone
// rotating IPs still can't flood one phone or run up the Twilio bill.
const OTP_PER_PHONE_PER_HOUR = 5;

const schema = z.object({
  phone: z.string().min(1),
});

export async function POST(request: Request) {
  if (!ORDERS_ENABLED) return errorResponse("Not found.", 404);

  return withRateLimit(
    request,
    async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return errorResponse("Unauthorized", 401);
      }

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return errorResponse("Invalid request body.", 400);
      }

      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return errorResponse("Phone number is required.", 400);
      }

      const phone = normalizeIndianMobile(parsed.data.phone);
      const phoneErr = indianMobileError(phone);
      if (phoneErr) {
        return errorResponse(phoneErr, 400);
      }

      const perPhone = await consumeRateLimit(`otp-phone:${phone}`, OTP_PER_PHONE_PER_HOUR, 60 * 60 * 1000);
      if (!perPhone.success) {
        return errorResponse("Too many OTP requests for this number. Please try again in an hour.", 429);
      }

      try {
        const { otp, expiresAt, cooldownMs } = await createAndStoreOtp(phone);
        const { mode } = await sendOtpSms(phone, otp);

        const isDev = process.env.NODE_ENV !== "production";

        return NextResponse.json({
          message:
            mode === "sms"
              ? "OTP sent to your mobile number."
              : "OTP generated. Check the server console (SMS not configured).",
          expiresAt: expiresAt.toISOString(),
          cooldownMs,
          ...(isDev && mode === "dev" ? { devOtp: otp } : {}),
        });
      } catch (error) {
        const cooldownMs = (error as Error & { cooldownMs?: number }).cooldownMs;
        if (cooldownMs != null) {
          return errorResponse("Please wait before requesting another OTP.", 429);
        }
        console.error("OTP send error:", error);
        return errorResponse("Failed to send OTP. Please try again.", 500);
      }
    },
    { limit: apiLimits.otp, identifier: "otp-send" }
  );
}
