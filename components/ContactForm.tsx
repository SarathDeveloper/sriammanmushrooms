"use client";

import { useState } from "react";

import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, WhatsAppHandoff } from "@/components/WhatsAppHandoff";
import {
  buildContactMessage,
  contactEnquirySchema,
  fieldErrors,
  INQUIRY_TYPES,
  openWhatsApp,
  whatsappLink,
} from "@/lib/whatsapp";

interface ContactFormProps {
  /** Pre-selects the enquiry type and hides the selector. */
  defaultInquiryType?: string;
  showCompany?: boolean;
  showLocation?: boolean;
  showEmail?: boolean;
  showMessage?: boolean;
  title?: string;
  description?: string;
  /** Prefix for input ids so two forms can share a page. */
  idPrefix?: string;
}

const selectStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235c6370' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: "2.5rem",
};

/** General enquiry form. Validates in the browser, then opens WhatsApp with the details. */
export function ContactForm({
  defaultInquiryType = "",
  showCompany = false,
  showLocation = false,
  showEmail = false,
  showMessage = false,
  title = "Send Us a Message",
  description = "Fill in your details and we'll open WhatsApp with your message ready to send.",
  idPrefix = "contact",
}: ContactFormProps) {
  const initialForm = {
    name: "",
    email: "",
    phone: "",
    location: "",
    company: "",
    inquiryType: defaultInquiryType,
    message: "",
  };
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [handoff, setHandoff] = useState<{ url: string; blocked: boolean } | null>(null);

  const id = (field: string) => `${idPrefix}-${field}`;
  const set = (field: keyof typeof initialForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  const describedBy = (field: string) => (errors[field] ? id(`${field}-error`) : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactEnquirySchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const url = whatsappLink(buildContactMessage(parsed.data));
    // Open synchronously inside the submit handler so popup blockers allow it.
    const opened = openWhatsApp(url);
    setHandoff({ url, blocked: !opened });
  };

  if (handoff) {
    return (
      <WhatsAppHandoff
        url={handoff.url}
        blocked={handoff.blocked}
        className="p-8 sm:p-12 min-h-[420px]"
        onReset={() => setHandoff(null)}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-card rounded-2xl border border-border space-y-5 p-6 sm:p-8"
    >
      <div>
        <h2 className="text-xl font-bold font-heading text-foreground">{title}</h2>
        <p className="text-base text-muted-foreground mt-0.5">{description}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={id("name")}>Full Name</Label>
        <Input
          id={id("name")}
          autoComplete="name"
          maxLength={80}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Your Full Name"
          aria-invalid={!!errors.name}
          aria-describedby={describedBy("name")}
        />
        <FieldError id={id("name-error")} message={errors.name} />
      </div>

      <div className={`grid ${showEmail ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-4`}>
        <div className="space-y-1.5">
          <Label htmlFor={id("phone")}>Mobile / WhatsApp Number</Label>
          <Input
            id={id("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={16}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="10-digit mobile number"
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone")}
          />
          <FieldError id={id("phone-error")} message={errors.phone} />
        </div>
        {showEmail && (
          <div className="space-y-1.5">
            <Label htmlFor={id("email")}>Email (optional)</Label>
            <Input
              id={id("email")}
              type="email"
              autoComplete="email"
              maxLength={120}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={describedBy("email")}
            />
            <FieldError id={id("email-error")} message={errors.email} />
          </div>
        )}
      </div>

      {showLocation && (
        <div className="space-y-1.5">
          <Label htmlFor={id("location")}>Your Village / Town (optional)</Label>
          <Input
            id={id("location")}
            maxLength={80}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. Vellimalai, Kallakurichi"
          />
        </div>
      )}

      {showCompany && (
        <div className="space-y-1.5">
          <Label htmlFor={id("company")}>Company Name (if any)</Label>
          <Input
            id={id("company")}
            maxLength={120}
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Company Name"
          />
        </div>
      )}

      {!defaultInquiryType && (
        <div className="space-y-1.5">
          <Label htmlFor={id("inquiry-type")}>What do you need?</Label>
          <select
            id={id("inquiry-type")}
            value={form.inquiryType}
            onChange={(e) => set("inquiryType", e.target.value)}
            aria-invalid={!!errors.inquiryType}
            aria-describedby={describedBy("inquiryType")}
            className="h-11 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-base outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 text-foreground appearance-none"
            style={selectStyle}
          >
            <option value="" disabled className="text-muted-foreground">
              Choose one...
            </option>
            {INQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <FieldError id={id("inquiryType-error")} message={errors.inquiryType} />
        </div>
      )}

      {showMessage && (
        <div className="space-y-1.5">
          <Label htmlFor={id("message")}>Your Message (optional)</Label>
          <textarea
            id={id("message")}
            value={form.message}
            maxLength={2000}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Tell us more about what you need..."
            rows={4}
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-base outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 resize-none"
          />
          <FieldError id={id("message-error")} message={errors.message} />
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-full h-12 mt-4 bg-whatsapp hover:bg-whatsapp-hover text-white"
      >
        <WhatsAppIcon className="size-5 mr-2" />
        Send on WhatsApp
      </Button>
    </form>
  );
}
