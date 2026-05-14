import { getUserTickets } from "@/features/support/server/actions";
import { SupportPageClient } from "@/features/support/components/support-page-client";

export const metadata = { title: "Contact Support" };

export default async function ContactSupportPage() {
  const tickets = await getUserTickets();
  return <SupportPageClient tickets={tickets} />;
}
