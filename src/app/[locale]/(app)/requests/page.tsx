import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { listOpenRequests } from "@/features/requests-market/server/actions";
import { getUserUsage } from "@/features/billing/server/usage";
import { RequestsListClient } from "@/features/requests-market/components/requests-list-client";
import { SponsoredCard } from "@/features/advertising/components/sponsored-card";
import { getActiveAdForPlacement } from "@/features/advertising/server/actions";

export const metadata: Metadata = {
  title: "Requests Market",
  description: "Post what you need — solutions, technology, or crew — and let providers find you",
};

export default async function RequestsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [requests, sidebarAd, usage] = await Promise.all([
    listOpenRequests({ limit: 100 }),
    getActiveAdForPlacement("sidebar"),
    user ? getUserUsage(user.id) : Promise.resolve(null),
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-9">
        <RequestsListClient
          requests={requests}
          canManage={!!user}
          requestsQuota={usage?.requestsThisMonth ?? null}
        />
      </div>
      <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-4">
        {sidebarAd && <SponsoredCard ad={sidebarAd} />}
      </aside>
    </div>
  );
}
