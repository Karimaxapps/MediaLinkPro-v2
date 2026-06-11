"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "@/components/ui/safe-image";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar, MapPin, Building2, Users, Video, Globe, Filter, X } from "lucide-react";
import type { Event } from "../types";
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "../types";
import type { EventType } from "../types";
import { CreateGate } from "@/components/subscription/create-gate";
import type { Quota } from "@/features/billing/server/usage";

type Props = {
  events: Event[];
  hasOrg?: boolean;
  eventsQuota?: Quota | null;
};

export function EventsListClient({ events, hasOrg = false, eventsQuota = null }: Props) {
  const t = useTranslations("events");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showOnlineOnly, setShowOnlineOnly] = useState<boolean | null>(null);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setShowOnlineOnly(null);
  };

  const hasActiveFilters = selectedTypes.length > 0 || showOnlineOnly !== null;

  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (selectedTypes.length > 0) {
      result = result.filter((e) => selectedTypes.includes(e.event_type));
    }

    if (showOnlineOnly === true) {
      result = result.filter((e) => e.is_online);
    } else if (showOnlineOnly === false) {
      result = result.filter((e) => !e.is_online);
    }

    return result;
  }, [events, selectedTypes, showOnlineOnly]);

  const eventTypeKeys = Object.keys(EVENT_TYPE_LABELS) as EventType[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{t("title")}</h1>
          <p className="text-sm text-gray-400">
            {t("listSubtitle")}
            <span className="text-gray-500 ml-2">
              {t("eventCount", { count: filteredEvents.length })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <CreateGate
            noun="event"
            nounPlural="events"
            href="/events/new"
            label={t("createEvent")}
            hasOrg={hasOrg}
            quota={eventsQuota}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Filter className="h-4 w-4" />
          <span>{t("typeFilter")}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {eventTypeKeys.map((key) => (
            <button
              key={key}
              onClick={() => toggleType(key)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                selectedTypes.includes(key)
                  ? "text-black font-medium"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              }`}
              style={
                selectedTypes.includes(key)
                  ? { backgroundColor: EVENT_TYPE_COLORS[key], borderColor: EVENT_TYPE_COLORS[key] }
                  : undefined
              }
            >
              {t(`eventTypes.${key}`)}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex gap-2">
          <button
            onClick={() => setShowOnlineOnly(showOnlineOnly === true ? null : true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
              showOnlineOnly === true
                ? "bg-[var(--brand-secondary)] text-white border-[var(--brand-secondary)]"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            {t("online")}
          </button>
          <button
            onClick={() => setShowOnlineOnly(showOnlineOnly === false ? null : false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
              showOnlineOnly === false
                ? "bg-[#10b981] text-white border-[#10b981]"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            {t("inPerson")}
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 ml-auto px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            {t("clear")}
          </button>
        )}
      </div>

      {/* Events grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={t("noEventsTitle")}
          description={hasActiveFilters ? t("noEventsFiltered") : t("noEventsEmpty")}
          actionLabel={hasActiveFilters ? t("clearFilters") : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      )}
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const t = useTranslations("events");
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const isSameDay = startDate.toDateString() === endDate.toDateString();
  const isPast = endDate < new Date();
  const color = EVENT_TYPE_COLORS[event.event_type as EventType] || "var(--brand)";

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group relative block rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-all overflow-hidden"
    >
      {/* Cover image or colored banner */}
      <div className="h-32 relative overflow-hidden">
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${color}20, ${color}05)`,
            }}
          />
        )}
        {/* Type badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-md"
          style={{ backgroundColor: color, color: "#000" }}
        >
          {t(`eventTypes.${event.event_type}`)}
        </div>
        {event.is_online && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 text-xs bg-[var(--brand-secondary)] text-white rounded-md">
            <Globe className="h-3 w-3" />
            {t("online")}
          </div>
        )}
        {isPast && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-sm font-medium text-white/70">{t("pastEvent")}</span>
          </div>
        )}
      </div>

      {event.logo_url && (
        <div className="absolute left-4 top-[6.5rem] z-10 h-12 w-12 rounded-lg overflow-hidden bg-[#121212] border border-white/15 shadow-lg flex items-center justify-center p-1">
          <Image
            src={event.logo_url}
            alt={`${event.title} logo`}
            width={48}
            height={48}
            className="h-full w-full object-contain"
          />
        </div>
      )}

      <div className={`p-4 space-y-3 ${event.logo_url ? "pt-7" : ""}`}>
        <h3 className="font-semibold text-white group-hover:text-[var(--brand)] transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center text-sm text-gray-400">
            <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>
              {format(startDate, "MMM d, yyyy")}
              {!isSameDay && ` - ${format(endDate, "MMM d, yyyy")}`}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {event.is_online ? t("onlineEvent") : event.location || t("tba")}
            </span>
          </div>
          {event.organizations && (
            <div className="flex items-center text-sm text-gray-400">
              {event.organizations.logo_url ? (
                <Image
                  src={event.organizations.logo_url}
                  alt={event.organizations.name}
                  title={event.organizations.name}
                  width={80}
                  height={20}
                  className="h-5 w-auto max-w-[120px] object-contain"
                />
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{event.organizations.name}</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center text-xs text-gray-500">
            <Users className="mr-1 h-3.5 w-3.5" />
            {t("interestedCount", { count: event.interest_count ?? 0 })}
          </div>
          <span className="text-xs text-[var(--brand)] font-medium group-hover:underline">
            {t("viewDetails")}
          </span>
        </div>
      </div>
    </Link>
  );
}
