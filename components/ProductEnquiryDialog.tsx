"use client";

import { useState } from "react";
import { MessageSquareText } from "lucide-react";

import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, WhatsAppHandoff } from "@/components/WhatsAppHandoff";
import {
  buildProductEnquiryMessage,
  fieldErrors,
  openWhatsApp,
  productEnquirySchema,
  whatsappLink,
} from "@/lib/whatsapp";

type EnquiryProduct = { name: string; weight: string };

const emptyForm = { name: "", phone: "", location: "", message: "" };

/** "Enquire" button that opens a short form and hands the enquiry to WhatsApp. */
export function EnquireButton({
  product,
  quantity = 1,
  className,
  size = "lg",
  children,
}: {
  product: EnquiryProduct;
  quantity?: number;
  className?: string;
  size?: "sm" | "default" | "lg";
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size={size} onClick={() => setOpen(true)} className={className}>
        {children ?? (
          <>
            <MessageSquareText size={18} className="mr-2" />
            Enquire Now
          </>
        )}
      </Button>
      {open && (
        <ProductEnquiryDialog
          product={product}
          quantity={quantity}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}

function ProductEnquiryDialog({
  product,
  quantity,
  open,
  onOpenChange,
}: {
  product: EnquiryProduct;
  quantity: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [qty, setQty] = useState(String(quantity));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [handoff, setHandoff] = useState<{ url: string; blocked: boolean } | null>(null);

  const set = (field: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = productEnquirySchema.safeParse({ ...form, quantity: qty });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const url = whatsappLink(buildProductEnquiryMessage(product, parsed.data));
    // Open synchronously inside the submit handler so popup blockers allow it.
    const opened = openWhatsApp(url);
    setHandoff({ url, blocked: !opened });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {handoff ? (
          <>
            <DialogTitle className="sr-only">Continue on WhatsApp</DialogTitle>
            <WhatsAppHandoff
              url={handoff.url}
              blocked={handoff.blocked}
              className="border-0 p-2"
              onReset={() => setHandoff(null)}
            />
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <DialogTitle>Enquire about {product.name}</DialogTitle>
              <DialogDescription className="mt-1">
                Fill in your details and we&apos;ll open WhatsApp with your enquiry ready to send.
              </DialogDescription>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="enq-name">Full Name</Label>
                <Input
                  id="enq-name"
                  maxLength={80}
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Your name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "enq-name-error" : undefined}
                />
                <FieldError id="enq-name-error" message={errors.name} />
              </div>
              <div className="space-y-1.5 w-24">
                <Label htmlFor="enq-qty">Packs</Label>
                <Input
                  id="enq-qty"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={999}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  aria-invalid={!!errors.quantity}
                  aria-describedby={errors.quantity ? "enq-qty-error" : undefined}
                />
              </div>
            </div>
            <FieldError id="enq-qty-error" message={errors.quantity} />

            <div className="space-y-1.5">
              <Label htmlFor="enq-phone">Mobile / WhatsApp Number</Label>
              <Input
                id="enq-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={16}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="10-digit mobile number"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "enq-phone-error" : undefined}
              />
              <FieldError id="enq-phone-error" message={errors.phone} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="enq-location">Town / City (optional)</Label>
              <Input
                id="enq-location"
                maxLength={80}
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Salem"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="enq-message">Anything else? (optional)</Label>
              <textarea
                id="enq-message"
                rows={2}
                maxLength={1000}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Delivery date, bulk needs, questions…"
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-base outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 resize-none"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full h-11 bg-whatsapp hover:bg-whatsapp-hover text-white"
            >
              <WhatsAppIcon className="size-5 mr-2" />
              Send on WhatsApp
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
