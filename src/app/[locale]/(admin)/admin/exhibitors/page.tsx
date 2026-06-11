import Link from "next/link";
import Image from "@/components/ui/safe-image";
import { Store } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCompaniesByExhibitorCount,
  getExhibitableEvents,
} from "@/features/events/server/exhibitor-actions";

export const metadata = { title: "Exhibitors — Admin" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ event?: string; min?: string }> };

export default async function AdminExhibitorsPage({ searchParams }: Props) {
  const { event, min } = await searchParams;
  const minEvents = min ? Number(min) : undefined;

  const [companies, events] = await Promise.all([
    getCompaniesByExhibitorCount({ eventSlug: event, minEvents }),
    getExhibitableEvents(),
  ]);

  const buildHref = (params: { event?: string; min?: string }) => {
    const sp = new URLSearchParams();
    if (params.event) sp.set("event", params.event);
    if (params.min) sp.set("min", params.min);
    const qs = sp.toString();
    return `/admin/exhibitors${qs ? `?${qs}` : ""}`;
  };

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
      active
        ? "bg-[var(--brand)] border-[var(--brand)] text-black"
        : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:bg-white/10"
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[var(--brand)]/20 p-2 text-[var(--brand)]">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Event Exhibitors</h1>
          <p className="text-sm text-gray-400">
            Companies ranked by how many industry events they exhibit at. Target the most active
            players.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href={buildHref({ min })} className={chip(!event)}>
          All events
        </Link>
        {events.map((ev) => (
          <Link
            key={ev.slug}
            href={buildHref({ event: ev.slug, min })}
            className={chip(event === ev.slug)}
          >
            {ev.title}
          </Link>
        ))}
        <span className="mx-2 h-5 w-px bg-white/10" />
        <Link href={buildHref({ event })} className={chip(!minEvents)}>
          Any count
        </Link>
        {[2, 3].map((n) => (
          <Link
            key={n}
            href={buildHref({ event, min: String(n) })}
            className={chip(minEvents === n)}
          >
            {n}+ events
          </Link>
        ))}
      </div>

      <div className="text-sm text-gray-400">
        {companies.length.toLocaleString()} compan{companies.length === 1 ? "y" : "ies"}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Company</th>
              <th className="px-4 py-3 font-semibold">Country</th>
              <th className="px-4 py-3 font-semibold">Events</th>
              <th className="px-4 py-3 text-right font-semibold">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {companies.map((c) => (
              <tr key={c.id} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <Link
                    href={`/companies/${c.slug}`}
                    className="flex items-center gap-3 font-medium text-white hover:text-[var(--brand)]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/5">
                      {c.logo_url ? (
                        <Image
                          src={c.logo_url}
                          alt={c.name}
                          width={32}
                          height={32}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Store className="h-4 w-4 text-gray-500" />
                      )}
                    </span>
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-400">{c.country ?? "—"}</td>
                <td className="px-4 py-3 text-gray-300">
                  {c.events.map((e) => e.title).join(", ")}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      "inline-flex min-w-7 justify-center rounded-full px-2 py-0.5 text-xs font-bold",
                      c.exhibitor_count >= 3
                        ? "bg-[var(--brand)]/20 text-[var(--brand)]"
                        : "bg-white/10 text-gray-300"
                    )}
                  >
                    {c.exhibitor_count}
                  </span>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                  No companies match this filter yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
