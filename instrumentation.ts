import * as Sentry from "@sentry/nextjs";

// Next.js calls register() once per server instance. Sentry's server and edge
// SDKs are only initialised from here; the sentry.*.config.ts files are not
// loaded automatically.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
    const { validateEnv } = await import("./lib/env");
    for (const warning of validateEnv().warnings) {
      console.warn(`[env] ${warning}`);
    }
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Reports errors from Server Components and route rendering.
export const onRequestError = Sentry.captureRequestError;
