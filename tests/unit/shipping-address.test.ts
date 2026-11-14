import { describe, expect, it } from "vitest";

import { readShippingAddress } from "@/lib/shipping-address";

describe("readShippingAddress", () => {
  it("reads a JSONB object written by checkout", () => {
    expect(
      readShippingAddress({ fullName: "Asha", address: "12 Main Rd", city: "Salem", pincode: "636001" }),
    ).toEqual({ fullName: "Asha", address: "12 Main Rd", city: "Salem", pincode: "636001" });
  });

  it("parses a legacy JSON string", () => {
    expect(readShippingAddress('{"fullName":"Ravi","city":"Erode"}')).toEqual({ fullName: "Ravi", city: "Erode" });
  });

  it("maps the old manual-order keys name/street to fullName/address", () => {
    expect(readShippingAddress({ name: "Manual", street: "5 Farm St" })).toEqual({
      fullName: "Manual",
      address: "5 Farm St",
    });
  });

  it("keeps non-JSON text as raw", () => {
    expect(readShippingAddress("Door 4, Salem")).toEqual({ raw: "Door 4, Salem" });
    expect(readShippingAddress({ raw: "Door 4, Salem" })).toEqual({ raw: "Door 4, Salem" });
  });

  it("returns an empty object for null, arrays, numbers and blank strings", () => {
    expect(readShippingAddress(null)).toEqual({});
    expect(readShippingAddress([1, 2])).toEqual({});
    expect(readShippingAddress(42)).toEqual({});
    expect(readShippingAddress("   ")).toEqual({});
  });

  it("drops non-string and empty values", () => {
    expect(readShippingAddress({ city: 7, phone: "", pincode: "636001" })).toEqual({ pincode: "636001" });
  });
});
