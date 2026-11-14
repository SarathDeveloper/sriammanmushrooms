import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { buildUpdatesMessage, whatsappLink } from "@/lib/whatsapp";

/**
 * "Get our updates" call to action. There is no mailing list behind the
 * showcase site, so visitors join the farm's WhatsApp updates instead.
 */
export function WhatsAppUpdatesButton() {
  return (
    <a
      href={whatsappLink(buildUpdatesMessage())}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 font-bold text-primary hover:bg-secondary transition-colors"
    >
      <WhatsAppIcon className="size-5 text-whatsapp" />
      Get Updates on WhatsApp
    </a>
  );
}
