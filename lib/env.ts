import { z } from "zod";

/**
 * Environment check for the showcase site. Nothing is required: the site has
 * no database, login or payments. Missing optional values only log a warning
 * at server start (see instrumentation.ts) so a misconfigured deploy is
 * visible in the logs instead of silently degrading.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  /**
   * Public site URL for canonical links, sitemap and Open Graph. On Vercel it
   * falls back to the project's production domain (lib/site.ts).
   */
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),

  /** Google Search Console HTML-tag verification code (content="..." value only). */
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional(),

  /** Only needed for images referenced as Cloudinary public IDs (products now use local photos). */
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

const PRODUCTION_WARNINGS: Array<[keyof Env, string]> = [
  ["SENTRY_DSN", "server errors will not be reported"],
];

export function validateEnv(source: NodeJS.ProcessEnv = process.env): {
  env: Env;
  warnings: string[];
} {
  const parsed = envSchema.safeParse(source);
  const warnings: string[] = [];

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      warnings.push(`${issue.path.join(".")}: ${issue.message}`);
    }
    return { env: envSchema.parse({ NODE_ENV: source.NODE_ENV }), warnings };
  }

  if (parsed.data.NODE_ENV === "production") {
    for (const [key, effect] of PRODUCTION_WARNINGS) {
      if (!parsed.data[key]) warnings.push(`${key} is not set: ${effect}.`);
    }
    if (!parsed.data.NEXT_PUBLIC_SITE_URL && !parsed.data.VERCEL_PROJECT_PRODUCTION_URL) {
      warnings.push(
        "NEXT_PUBLIC_SITE_URL is not set: canonical URLs and the sitemap will use https://vellimalaifarms.in.",
      );
    }
  }

  return { env: parsed.data, warnings };
}
