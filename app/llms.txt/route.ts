import { getProducts } from "@/lib/content";
import { HOME_FAQ } from "@/lib/faq";
import { buildLlmsTxt } from "@/lib/llms";

// Built once at build time from the static content.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt({ products: getProducts(), faq: HOME_FAQ }), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
