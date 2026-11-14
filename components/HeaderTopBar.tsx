import { Clock, Mail, Phone, Truck } from "lucide-react";

import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { CONTACT_EMAIL, CONTACT_PHONE, INSTAGRAM, OPENING_HOURS } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

const iconLink =
  "flex h-7 w-7 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white";

/**
 * Slim contact strip above the navbar on every page.
 * Desktop: phone, email and hours | delivery offer | WhatsApp + Instagram.
 * Mobile: delivery offer | call, WhatsApp and Instagram icons.
 */
export function HeaderTopBar() {
  return (
    <div className="bg-[#1A4938] text-white">
      <div className="container mx-auto flex h-9 max-w-7xl items-center justify-between gap-3 px-4 text-xs sm:px-6 sm:text-sm lg:px-8">
        {/* Contact details (tablet and up) */}
        <div className="hidden min-w-0 items-center gap-4 md:flex">
          <a href={`tel:${CONTACT_PHONE.e164}`} className="flex items-center gap-1.5 whitespace-nowrap hover:underline">
            <Phone size={13} className="opacity-80" />
            {CONTACT_PHONE.display}
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-1.5 whitespace-nowrap hover:underline">
            <Mail size={13} className="opacity-80" />
            {CONTACT_EMAIL}
          </a>
          <span className="hidden items-center gap-1.5 whitespace-nowrap text-white/80 xl:flex">
            <Clock size={13} className="opacity-80" />
            {OPENING_HOURS}
          </span>
        </div>

        {/* Delivery offer */}
        <p className="flex min-w-0 items-center gap-1.5 font-medium md:hidden lg:flex">
          <Truck size={14} className="shrink-0 opacity-80" />
          <span className="truncate">
            Free delivery above <span className="font-bold">₹500</span>
          </span>
        </p>

        {/* Quick actions and social */}
        <div className="flex shrink-0 items-center gap-1">
          <a href={`tel:${CONTACT_PHONE.e164}`} aria-label={`Call ${CONTACT_PHONE.display}`} className={`${iconLink} md:hidden`}>
            <Phone size={14} />
          </a>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className={`${iconLink} hover:bg-whatsapp`}
          >
            <WhatsAppIcon className="size-3.5" />
          </a>
          <a
            href={INSTAGRAM.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram @${INSTAGRAM.handle}`}
            className={`${iconLink} hover:bg-[#E4405F]`}
          >
            <InstagramIcon className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
