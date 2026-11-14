"use client";

import { CalendarCheck, CheckCircle2, Package, Sprout } from "lucide-react";
import { useState } from "react";

import { FadeIn } from "@/components/FadeIn";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, WhatsAppHandoff } from "@/components/WhatsAppHandoff";
import {
  buildPreOrderMessage,
  fieldErrors,
  openWhatsApp,
  preOrderSchema,
  whatsappLink,
} from "@/lib/whatsapp";

const benefits = [
  {
    icon: Sprout,
    title: "Get the Freshest Batch",
    desc: "Lock in mushrooms when they're at their freshest, before limited batches sell out.",
  },
  {
    icon: CalendarCheck,
    title: "Choose Your Date",
    desc: "Pick a preferred delivery or pickup window that fits your plans.",
  },
  {
    icon: Package,
    title: "Confirmed Availability",
    desc: "We'll confirm stock on WhatsApp before you need to arrange payment.",
  },
];

const initialForm = {
  name: "",
  phone: "",
  email: "",
  product: "",
  quantity: "",
  preferredDate: "",
  location: "",
  notes: "",
};

type Field = keyof typeof initialForm;

export function PreOrderSection() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [handoff, setHandoff] = useState<{ url: string; blocked: boolean } | null>(null);

  const handleChange = (field: Field, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = preOrderSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const url = whatsappLink(buildPreOrderMessage(parsed.data));
    // Open synchronously inside the submit handler so popup blockers allow it.
    const opened = openWhatsApp(url);
    setHandoff({ url, blocked: !opened });
  };

  const fieldProps = (field: Field) => ({
    id: `preorder-${field}`,
    value: form[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(field, e.target.value),
    "aria-invalid": !!errors[field],
    "aria-describedby": errors[field] ? `preorder-${field}-error` : undefined,
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="py-12 sm:py-16 bg-background grain-overlay">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <FadeIn className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-6 sm:w-8 bg-border" />
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Book Early</span>
            <span className="h-px w-6 sm:w-8 bg-border" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
            Pre-Order Fresh Mushrooms
          </h2>
          <p className="text-[var(--color-body)] max-w-2xl mx-auto mt-3 text-base sm:text-lg">
            Seasonal mushrooms sell out fast. Send us your pre-order on WhatsApp and we&apos;ll confirm availability.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-8">
            <FadeIn direction="right">
              <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground mb-2">
                Why Pre-Order?
              </h2>
              <p className="text-[var(--color-body)] mb-8 text-sm sm:text-base">
                Seasonal and specialty mushrooms move quickly. Pre-ordering ensures you get the
                harvest you want without last-minute stockouts.
              </p>
              <div className="space-y-6">
                {benefits.map((b) => (
                  <div key={b.title} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <b.icon size={22} strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1 text-base">{b.title}</h3>
                      <p className="text-base text-[var(--color-body)]">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <FadeIn direction="left" className="lg:col-span-2">
            {handoff ? (
              <WhatsAppHandoff
                url={handoff.url}
                blocked={handoff.blocked}
                title="Send Your Pre-Order"
                className="h-full p-8 sm:p-12"
                onReset={() => setHandoff(null)}
              />
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-card rounded-2xl p-6 sm:p-8 border border-border space-y-5"
              >
                <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground">
                  Place a Pre-Order
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="preorder-name">Full Name</Label>
                    <Input {...fieldProps("name")} autoComplete="name" maxLength={80} placeholder="Your name" className="h-11 bg-white" />
                    <FieldError id="preorder-name-error" message={errors.name} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="preorder-phone">Mobile / WhatsApp Number</Label>
                    <Input
                      {...fieldProps("phone")}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={16}
                      placeholder="10-digit mobile number"
                      className="h-11 bg-white"
                    />
                    <FieldError id="preorder-phone-error" message={errors.phone} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="preorder-email">Email (optional)</Label>
                    <Input
                      {...fieldProps("email")}
                      type="email"
                      autoComplete="email"
                      maxLength={120}
                      placeholder="you@email.com"
                      className="h-11 bg-white"
                    />
                    <FieldError id="preorder-email-error" message={errors.email} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="preorder-product">Product(s)</Label>
                    <Input {...fieldProps("product")} maxLength={120} placeholder="e.g. Oyster, Button" className="h-11 bg-white" />
                    <FieldError id="preorder-product-error" message={errors.product} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="preorder-quantity">Quantity</Label>
                    <Input {...fieldProps("quantity")} maxLength={40} placeholder="e.g. 2kg" className="h-11 bg-white" />
                    <FieldError id="preorder-quantity-error" message={errors.quantity} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="preorder-preferredDate">Preferred Date</Label>
                    <Input {...fieldProps("preferredDate")} type="date" min={today} className="h-11 bg-white" />
                    <FieldError id="preorder-preferredDate-error" message={errors.preferredDate} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="preorder-location">Delivery Location</Label>
                    <Input {...fieldProps("location")} maxLength={120} placeholder="City, Area" className="h-11 bg-white" />
                    <FieldError id="preorder-location-error" message={errors.location} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="preorder-notes">Notes (optional)</Label>
                    <textarea
                      id="preorder-notes"
                      value={form.notes}
                      maxLength={1000}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      placeholder="Pickup preference, packaging notes, or anything else..."
                      rows={4}
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-base outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-base text-muted-foreground">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  We confirm every pre-order on WhatsApp before payment.
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto rounded-full h-12 px-10 bg-whatsapp hover:bg-whatsapp-hover text-white"
                >
                  <WhatsAppIcon className="size-5 mr-2" />
                  Send Pre-Order on WhatsApp
                </Button>
              </form>
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
