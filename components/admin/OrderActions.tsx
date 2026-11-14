"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import type { ShippingAddress } from "@/lib/shipping-address";

// Customer-entered text goes into the print window's HTML, so escape it.
function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type OrderActionsProps = {
  order: {
    id: string;
    totalAmount: number;
    status: string;
    orderItems: Array<{
      id: string;
      quantity: number;
      price: number;
      product: { name: string; weight: string };
    }>;
  };
  address: ShippingAddress;
};

export function OrderActions({ order, address }: OrderActionsProps) {
  function handlePrint() {
    const printContent = `
      <html>
        <head>
          <title>Order #${esc(order.id.slice(0, 8).toUpperCase())}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
            h1 { font-size: 18px; margin-bottom: 5px; }
            h2 { font-size: 14px; margin: 15px 0 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .meta { color: #666; font-size: 12px; margin-bottom: 15px; }
            .item { display: flex; justify-content: space-between; margin: 8px 0; font-size: 13px; }
            .item-name { flex: 1; }
            .total { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 16px; }
            .address { font-size: 13px; line-height: 1.5; }
            .slot { background: #f5f5f5; padding: 8px; margin-top: 10px; font-size: 12px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>Sri Amman Mushroom Farms</h1>
          <p class="meta">Order #${esc(order.id.slice(0, 8).toUpperCase())} · ${esc(order.status)}</p>
          
          <h2>Items</h2>
          ${order.orderItems.map((item) => `
            <div class="item">
              <span class="item-name">${esc(item.product.name)} (${esc(item.product.weight)}) × ${esc(item.quantity)}</span>
              <span>₹${item.price * item.quantity}</span>
            </div>
          `).join("")}
          <div class="item total">
            <span>Total</span>
            <span>₹${order.totalAmount}</span>
          </div>
          
          <h2>Deliver To</h2>
          <div class="address">
            ${address.fullName ? `<strong>${esc(address.fullName)}</strong><br>` : ""}
            ${address.address ? `${esc(address.address)}<br>` : ""}
            ${address.raw ? `${esc(address.raw)}<br>` : ""}
            ${esc([address.city, address.state, address.pincode].filter(Boolean).join(", "))}<br>
            ${address.phone ? `📞 ${esc(address.phone)}` : ""}
          </div>
          ${address.deliverySlot ? `<div class="slot">🕐 ${esc(address.deliverySlot)}</div>` : ""}
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  function handleWhatsApp() {
    const items = order.orderItems
      .map((item) => `• ${item.product.name} (${item.product.weight}) × ${item.quantity} = ₹${item.price * item.quantity}`)
      .join("\n");

    const addressLine = [
      address.fullName,
      address.address,
      address.raw,
      [address.city, address.state, address.pincode].filter(Boolean).join(", "),
    ]
      .filter(Boolean)
      .join("\n");

    const message = `*Sri Amman Mushroom Farms - Packing Slip*

Order: #${order.id.slice(0, 8).toUpperCase()}
Status: ${order.status}

*Items:*
${items}

*Total: ₹${order.totalAmount}*

*Deliver To:*
${addressLine}
${address.phone ? `📞 ${address.phone}` : ""}
${address.deliverySlot ? `\n🕐 Slot: ${address.deliverySlot}` : ""}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
        <Printer size={14} /> Print
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5 text-whatsapp hover:text-whatsapp" onClick={handleWhatsApp}>
        <WhatsAppIcon className="size-3.5" /> WhatsApp
      </Button>
    </div>
  );
}
