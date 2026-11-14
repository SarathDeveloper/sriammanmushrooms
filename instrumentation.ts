import * as Sentry from "@sentry/nextjs";

// Next.js calls register() once per server instance. Sentry's server and edge
// SDKs are only initialised from here; the sentry.*.config.ts files are not
// loaded automatically.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
    const { validateEnv } = await import("./lib/env");
    validateEnv();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Reports errors from Server Components, Route Handlers and Server Actions.
export const onRequestError = Sentry.captureRequestError;
