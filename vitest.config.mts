import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.dirname(fileURLToPath(import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Integration tests share one database; run files one at a time.
    fileParallelism: false,
    env: {
      NEXTAUTH_SECRET: "test-secret-for-vitest-only-0123456789",
    },
  },
});
