import { z } from "zod";

/**
 * Server environment validation. Runs once at server start (see
 * instrumentation.ts). In production a missing required variable stops the
 * server instead of failing later on the first request that needs it.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Always required: catalogue reads and admin login.
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
    NEXTAUTH_URL: z.string().url().optional(),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

    // Every product image renders through Cloudinary, so pages fail without it.
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1, "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required (product images)"),
    // Admin image uploads (signed). The API key is read by next-cloudinary in
    // the browser, so it is NEXT_PUBLIC_; only the secret must stay server-side.
    NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string().optional(),
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

    // Only needed when online ordering is switched on.
    NEXT_PUBLIC_ORDERS_ENABLED: z.string().optional(),
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_SMS_FROM: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NEXT_PUBLIC_ORDERS_ENABLED !== "true") return;
    const needed = [
      "RAZORPAY_KEY_ID",
      "RAZORPAY_KEY_SECRET",
      "NEXT_PUBLIC_RAZORPAY_KEY_ID",
      "TWILIO_ACCOUNT_SID",
      "TWILIO_AUTH_TOKEN",
      "TWILIO_SMS_FROM",
    ] as const;
    for (const key of needed) {
      if (!env[key]) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `${key} is required when NEXT_PUBLIC_ORDERS_ENABLED=true`,
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

const OPTIONAL_WARNINGS: Array<[keyof Env, string]> = [
  ["CLOUDINARY_API_SECRET", "admin image uploads will fail"],
  ["NEXT_PUBLIC_CLOUDINARY_API_KEY", "admin image uploads will fail"],
  ["SENTRY_DSN", "server errors will not be reported"],
];

export function validateEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const lines = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    const message = `Invalid environment variables:\n${lines}`;

    if (source.NODE_ENV === "production") {
      throw new Error(message);
    }
    console.error(`[env] ${message}`);
    return source as unknown as Env;
  }

  if (parsed.data.NODE_ENV === "production") {
    if (parsed.data.NEXTAUTH_SECRET.length < 32) {
      console.warn("[env] NEXTAUTH_SECRET is shorter than 32 characters; generate a longer one with `openssl rand -base64 32`.");
    }
    for (const [key, effect] of OPTIONAL_WARNINGS) {
      if (!parsed.data[key]) console.warn(`[env] ${key} is not set: ${effect}.`);
    }
  }

  return parsed.data;
}
