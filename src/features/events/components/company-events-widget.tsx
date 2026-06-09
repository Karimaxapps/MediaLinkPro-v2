import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateGate } from "@/components/subscription/create-gate";
import { getOrganizationEvents } from "@/features/events/server/actions";
import type { Quota } from "@/features/billing/server/usage";

type Props = {
  orgId: string;
  eventsQuota?: Quota;
};

export async function CompanyEventsWidget({ orgId, eventsQuota }: Props) {
  const [t, events] = await Promise.all([
    getTranslations("events"),
    getOrganizationEvents(orgId),
  ]);
  const upcoming = events
    // eslint-disable-next-line react-hooks/purity
    .filter((e) => new Date(e.start_date).getTime() > Date.now())
    .slice(0, 4);

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--brand)]" />
            {t("events")}
          </CardTitle>
          <p className="text-xs text-gray-400 mt-1">
            {t("totalUpcoming", { total: events.length, upcoming: upcoming.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/events">
            <Button
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs"
            >
              {t("browseAll")}
            </Button>
          </Link>
          <CreateGate
            noun="event"
            nounPlural="events"
            href="/events/new"
            label={t("createEventLower")}
            hasOrg={true}
            quota={eventsQuota}
          />
        </div>
      </CardHeader>

      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">{t("noUpcomingCreate")}</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.slug}`}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:bg-white/[0.05] transition-colors"
              >
                {e.logo_url ? (
                  <div className="shrink-0 size-10 rounded-md overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-0.5">
                    <Image
                      src={e.logo_url}
                      alt={`${e.title} logo`}
                      width={40}
                      height={40}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 size-10 rounded-md bg-[var(--brand)]/15 text-[var(--brand)] flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase font-semibold leading-none">
                      {format(new Date(e.start_date), "MMM")}
                    </span>
                    <span className="text-sm font-bold leading-none mt-0.5">
                      {format(new Date(e.start_date), "d")}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">{e.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                    {e.is_online ? (
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3" /> {t("online")}
                      </span>
                    ) : e.location ? (
                      <span className="inline-flex items-center gap-1 truncate">
                        <MapPin className="size-3" /> {e.location}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
