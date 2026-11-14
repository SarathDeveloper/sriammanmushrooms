"use client";

import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shown after a form opens WhatsApp. The link is always visible because the
 * new tab may have been blocked, or the visitor closed it before sending.
 */
export function WhatsAppHandoff({
  url,
  blocked,
  title = "Continue on WhatsApp",
  onReset,
  resetLabel = "Edit details",
  className,
}: {
  url: string;
  blocked: boolean;
  title?: string;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center text-center bg-card rounded-2xl border border-border p-8",
        className,
      )}
    >
      <div className="w-16 h-16 rounded-full bg-whatsapp/15 text-whatsapp flex items-center justify-center mb-5">
        <WhatsAppIcon className="size-8" />
      </div>
      <h3 className="text-2xl font-bold font-heading text-foreground mb-2">{title}</h3>
      <p className="text-[var(--color-body)] max-w-sm mb-6 text-base leading-relaxed">
        {blocked
          ? "Your browser stopped WhatsApp from opening. Tap the button below. Your message is ready, just press send."
          : "We've opened WhatsApp with your details filled in. Press send there and we'll reply shortly. If it didn't open, use the button below."}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-base font-semibold text-white hover:bg-whatsapp-hover transition-colors"
      >
        <WhatsAppIcon className="size-5" />
        Open WhatsApp
      </a>
      {onReset && (
        <Button variant="ghost" className="mt-3 rounded-full" onClick={onReset}>
          {resetLabel}
        </Button>
      )}
    </div>
  );
}

/** Small inline validation message under a field. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive mt-1">
      {message}
    </p>
  );
}
