import { describe, expect, it } from "vitest";

import {
  buildContactMessage,
  buildPreOrderMessage,
  buildProductEnquiryMessage,
  contactEnquirySchema,
  fieldErrors,
  preOrderSchema,
  productEnquirySchema,
  WHATSAPP_NUMBER,
  whatsappLink,
} from "@/lib/whatsapp";

describe("whatsappLink", () => {
  it("links to the farm number without text", () => {
    expect(whatsappLink()).toBe(`https://wa.me/${WHATSAPP_NUMBER}`);
  });

  it("URL-encodes the message", () => {
    const url = whatsappLink("Hi & hello\nLine 2 #1");
    expect(url).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20%26%20hello%0ALine%202%20%231`);
    expect(decodeURIComponent(new URL(url).searchParams.get("text")!)).toBe("Hi & hello\nLine 2 #1");
  });
});

describe("productEnquirySchema", () => {
  it("normalises a pasted +91 number and coerces quantity", () => {
    const parsed = productEnquirySchema.parse({
      name: "  Priya ",
      phone: "+91 98765 43210",
      quantity: "3",
    });
    expect(parsed).toEqual({ name: "Priya", phone: "9876543210", quantity: 3, location: "", message: "" });
  });

  it("rejects bad names, numbers and quantities with readable messages", () => {
    const result = productEnquirySchema.safeParse({ name: "A", phone: "12345", quantity: "0" });
    expect(result.success).toBe(false);
    const errors = fieldErrors(result.error!);
    expect(errors.name).toBe("Please enter your name.");
    expect(errors.phone).toBe("Enter a valid 10-digit mobile number.");
    expect(errors.quantity).toBe("Enter at least 1 pack.");
  });

  it("requires mobiles to start with 6-9", () => {
    const result = productEnquirySchema.safeParse({ name: "Ravi", phone: "5876543210", quantity: 1 });
    expect(fieldErrors(result.error!).phone).toBe("Mobile number must start with 6, 7, 8, or 9.");
  });
});

describe("contactEnquirySchema", () => {
  it("accepts an empty optional email but rejects an invalid one", () => {
    const base = { name: "Ravi", phone: "9876543210", inquiryType: "Training" };
    expect(contactEnquirySchema.safeParse({ ...base, email: "" }).success).toBe(true);
    const bad = contactEnquirySchema.safeParse({ ...base, email: "not-an-email" });
    expect(fieldErrors(bad.error!).email).toBe("Enter a valid email address.");
  });

  it("requires an enquiry type", () => {
    const result = contactEnquirySchema.safeParse({ name: "Ravi", phone: "9876543210", inquiryType: "" });
    expect(fieldErrors(result.error!).inquiryType).toBe("Please choose what you need.");
  });
});

describe("message builders", () => {
  it("builds a product enquiry with only the filled-in fields", () => {
    const message = buildProductEnquiryMessage(
      { name: "Shiitake Exotic", weight: "200g" },
      productEnquirySchema.parse({ name: "Priya", phone: "9876543210", quantity: 2, location: "Salem" }),
    );
    expect(message).toBe(
      [
        "Hi Sri Amman Mushroom Farms! I'd like to enquire about a product.",
        "",
        "Product: Shiitake Exotic (200g)",
        "Quantity: 2 packs",
        "Name: Priya",
        "Mobile: 9876543210",
        "Location: Salem",
        "",
        "Please confirm availability, price and delivery.",
      ].join("\n"),
    );
  });

  it("uses singular pack and appends the customer's note", () => {
    const message = buildProductEnquiryMessage(
      { name: "Button Mushroom", weight: "200g" },
      productEnquirySchema.parse({ name: "Ravi", phone: "9876543210", quantity: 1, message: "Deliver Friday" }),
    );
    expect(message).toContain("Quantity: 1 pack\n");
    expect(message).not.toContain("Location:");
    expect(message).toContain("\n\nDeliver Friday\n\n");
  });

  it("builds a contact message", () => {
    const message = buildContactMessage(
      contactEnquirySchema.parse({
        name: "Anita",
        phone: "9876543210",
        email: "anita@example.com",
        inquiryType: "Wholesale",
        company: "Anita Foods",
        message: "Need 50kg weekly",
      }),
    );
    expect(message).toBe(
      [
        "Hi Sri Amman Mushroom Farms! I have an enquiry.",
        "",
        "Enquiry: Wholesale",
        "Name: Anita",
        "Mobile: 9876543210",
        "Email: anita@example.com",
        "Company: Anita Foods",
        "",
        "Need 50kg weekly",
      ].join("\n"),
    );
  });

  it("builds a pre-order message with a readable date", () => {
    const message = buildPreOrderMessage(
      preOrderSchema.parse({
        name: "Kumar",
        phone: "9876543210",
        product: "Oyster",
        quantity: "2kg",
        preferredDate: "2026-12-05",
        location: "Erode",
        notes: "Morning delivery",
      }),
    );
    expect(message).toContain("Product(s): Oyster\nQuantity: 2kg\nPreferred date: 5 Dec 2026\nDelivery location: Erode");
    expect(message).toContain("Notes: Morning delivery");
    expect(message).not.toContain("Email:");
  });
});
