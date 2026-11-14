import type { MetadataRoute } from "next";

import { absoluteUrl, SITE_URL } from "@/lib/site";

/**
 * AI search and answer-engine crawlers, allowed explicitly so the farm can be
 * found and quoted by ChatGPT, Perplexity, Claude, Gemini, Copilot and Apple
 * Intelligence (they are also covered by the "*" rule; listing them makes the
 * intent clear and survives anyone tightening the default rule later).
 */
export const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
] as const;

// Everything public is crawlable.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: [...AI_CRAWLERS], allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
