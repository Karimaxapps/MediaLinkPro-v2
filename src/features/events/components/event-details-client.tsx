"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { sanitizeHtml } from "@/lib/sanitize";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Building2,
  Users,
  Globe,
  Clock,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  X,
  Linkedin,
  Facebook,
  Youtube,
  Twitter,
  Instagram,
} from "lucide-react";
import type { Event, EventInterest, EventInterestType, EventRegistration } from "../types";
import { EVENT_TYPE_COLORS, type EventType } from "../types";
import {
  registerForEvent,
  cancelRegistration,
  setEventInterest,
  clearEventInterest,
} from "../server/actions";
import { addExhibitor, removeExhibitor } from "../server/exhibitor-actions";
import { Store, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function EventDetailsClient({
  event,
  initialRegistration,
  initialInterests = [],
  initialMyInterest = null,
  exhibitorOrgs = [],
  initialExhibitingOrgIds = [],
}: {
  event: Event;
  initialRegistration: EventRegistration | null;
  initialInterests?: EventInterest[];
  initialMyInterest?: EventInterest | null;
  exhibitorOrgs?: { id: string; name: string; slug: string; logo_url: string | null }[];
  initialExhibitingOrgIds?: string[];
}) {
  const t = useTranslations("events");
  const [registration, setRegistration] = useState(initialRegistration);
  const [interests, setInterests] = useState<EventInterest[]>(initialInterests);
  const [myInterest, setMyInterest] = useState<EventInterest | null>(initialMyInterest);
  const [exhibitingOrgIds, setExhibitingOrgIds] = useState<string[]>(initialExhibitingOrgIds);
  const [isPending, startTransition] = useTransition();
  const [isInterestPending, startInterestTransition] = useTransition();
  const [isExhibitPending, startExhibitTransition] = useTransition();

  const handleToggleExhibit = (orgId: string) => {
    const isExhibiting = exhibitingOrgIds.includes(orgId);
    startExhibitTransition(async () => {
      const result = isExhibiting
        ? await removeExhibitor(event.id, orgId)
        : await addExhibitor(event.id, orgId);
      if (result.success) {
        setExhibitingOrgIds((prev) =>
          isExhibiting ? prev.filter((id) => id !== orgId) : [...prev, orgId]
        );
        toast.success(isExhibiting ? t("exhibitRemoved") : t("exhibitAdded"));
      } else {
        toast.error(result.error ?? t("failedUpdate"));
      }
    });
  };

  const interestCount =
    interests.length > (event.interest_count ?? 0) ? interests.length : (event.interest_count ?? 0);

  const handleSetInterest = (next: EventInterestType) => {
    // Toggle off if user clicks their current choice.
    if (myInterest?.interest === next) {
      startInterestTransition(async () => {
        const result = await clearEventInterest(event.id);
        if (result.success) {
          setMyInterest(null);
          setInterests((prev) => prev.filter((i) => i.user_id !== myInterest.user_id));
        } else {
          toast.error(result.error ?? t("failedUpdate"));
        }
      });
      return;
    }
    startInterestTransition(async () => {
      const result = await setEventInterest(event.id, next);
      if (result.success) {
        toast.success(next === "going" ? t("youreGoingExcl") : t("markedMaybe"));
        const updated: EventInterest = {
          id: myInterest?.id ?? "temp",
          event_id: event.id,
          user_id: myInterest?.user_id ?? "self",
          interest: next,
          created_at: myInterest?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profiles: myInterest?.profiles,
        };
        setMyInterest(updated);
        setInterests((prev) => {
          const without = prev.filter((i) => i.user_id !== updated.user_id);
          return [updated, ...without];
        });
      } else {
        toast.error(result.error ?? "Failed to update");
      }
    });
  };

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const isSameDay = startDate.toDateString() === endDate.toDateString();
  const isPast = endDate < new Date();
  const color = EVENT_TYPE_COLORS[event.event_type as EventType] || "var(--brand)";
  const isFull = event.max_attendees != null && event.registration_count >= event.max_attendees;

  const handleRegister = () => {
    startTransition(async () => {
      const result = await registerForEvent(event.id);
      if (result.success) {
        toast.success(t("youreRegistered"));
        setRegistration({
          id: "temp",
          event_id: event.id,
          user_id: "",
          status: isFull ? "waitlisted" : "registered",
          registered_at: new Date().toISOString(),
        });
      } else {
        toast.error(result.error ?? t("failedRegister"));
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelRegistration(event.id);
      if (result.success) {
        toast.success(t("registrationCancelled"));
        setRegistration(null);
      } else {
        toast.error(result.error ?? t("failedCancel"));
      }
    });
  };

  return (
    <div className="space-y-6">
      <Link
        href="/events"
        className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        {t("backToEvents")}
      </Link>

      {/* Cover */}
      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden border border-white/10">
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${color}30, ${color}05)` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-2.5 py-1 text-xs font-medium rounded-md"
              style={{ backgroundColor: color, color: "#000" }}
            >
              {t(`eventTypes.${event.event_type}`)}
            </span>
            {event.is_online && (
              <span className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[var(--brand-secondary)] text-white rounded-md">
                <Globe className="h-3 w-3" />
                {t("online")}
              </span>
            )}
            {isPast && (
              <span className="px-2.5 py-1 text-xs bg-gray-700 text-white rounded-md">{t("past")}</span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
          {event.organizations && (
            <Link
              href={`/companies/${event.organizations.slug}`}
              className="inline-flex items-center gap-2 mt-1 group"
            >
              <div className="h-6 w-6 rounded-full overflow-hidden bg-white/10 border border-white/20 flex-shrink-0 flex items-center justify-center">
                {event.organizations.logo_url ? (
                  <Image
                    src={event.organizations.logo_url}
                    alt={event.organizations.name}
                    width={24}
                    height={24}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Building2 className="h-3 w-3 text-gray-400" />
                )}
              </div>
              <span className="text-sm text-gray-300 group-hover:text-[var(--brand)] transition-colors">
                {event.organizations.name}
              </span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {event.description && (
            <section className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white mb-3">{t("aboutEvent")}</h2>
              <div
                className="text-sm text-gray-300 leading-relaxed [&_p]:my-3 [&_strong]:text-white [&_strong]:font-semibold [&_em]:italic [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-5 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:space-y-1 [&_li]:marker:text-[var(--brand)] [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--brand)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:my-3 [&_a]:text-[var(--brand)] [&_a]:underline [&_a]:underline-offset-2 [&_code]:bg-black/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description ?? "") }}
              />
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Organized by */}
          {event.organizations && (
            <Link
              href={`/companies/${event.organizations.slug}`}
              className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-4 group hover:border-[var(--brand)]/40 transition-colors block"
            >
              <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
                {event.organizations.logo_url ? (
                  <Image
                    src={event.organizations.logo_url}
                    alt={event.organizations.name}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Building2 className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-0.5">
                  {t("organizedBy")}
                </div>
                <div className="text-white font-semibold truncate group-hover:text-[var(--brand)] transition-colors">
                  {event.organizations.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{t("viewCompanyProfile")}</div>
              </div>
            </Link>
          )}

          <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-[var(--brand)] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-gray-400">{t("date")}</div>
                <div className="text-white font-medium">
                  {format(startDate, "MMM d, yyyy")}
                  {!isSameDay && ` — ${format(endDate, "MMM d, yyyy")}`}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-[var(--brand)] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-gray-400">{t("time")}</div>
                <div className="text-white font-medium">
                  {format(startDate, "h:mm a")} — {format(endDate, "h:mm a")}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[var(--brand)] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-gray-400">{t("location")}</div>
                <div className="text-white font-medium">
                  {event.is_online ? t("onlineEvent") : event.location || t("tba")}
                </div>
                {event.is_online && event.online_url && registration && (
                  <a
                    href={event.online_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-xs text-[var(--brand-secondary)] hover:underline"
                  >
                    {t("joinLink")} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-[var(--brand)] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-400">{t("interested")}</div>
                <div className="text-white font-medium">
                  {t("personCount", { count: interestCount })}
                </div>
                {interests.length > 0 && (
                  <div className="flex items-center mt-2">
                    <div className="flex -space-x-2">
                      {interests.slice(0, 5).map((i) => (
                        <Link
                          key={i.id}
                          href={i.profiles?.username ? `/profiles/${i.profiles.username}` : "#"}
                          title={i.profiles?.full_name ?? t("attendee")}
                        >
                          <Avatar className="h-7 w-7 border-2 border-[#0B0F14] hover:ring-2 hover:ring-[var(--brand)] transition">
                            <AvatarImage
                              src={i.profiles?.avatar_url ?? undefined}
                              alt={i.profiles?.full_name ?? t("attendee")}
                            />
                            <AvatarFallback className="bg-[var(--brand-secondary)]/20 text-[var(--brand-secondary)] text-[10px]">
                              {(i.profiles?.full_name ?? "?").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                      ))}
                    </div>
                    {interestCount > 5 && (
                      <span className="ml-2 text-xs text-gray-400">{t("moreCount", { count: interestCount - 5 })}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {!isPast && (
              <div className="pt-2 border-t border-white/10 space-y-3">
                {/* Interest buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={() => handleSetInterest("going")}
                    disabled={isInterestPending}
                    className={
                      myInterest?.interest === "going"
                        ? "w-full bg-[#10b981] hover:bg-[#0e9f70] text-black font-medium"
                        : "w-full bg-transparent border border-white/10 text-white hover:bg-white/10"
                    }
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    {t("illGo")}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSetInterest("maybe")}
                    disabled={isInterestPending}
                    className={
                      myInterest?.interest === "maybe"
                        ? "w-full bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium"
                        : "w-full bg-transparent border border-white/10 text-white hover:bg-white/10"
                    }
                  >
                    {t("maybe")}
                  </Button>
                </div>

                {/* Registration */}
                {registration ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {registration.status === "waitlisted" ? t("onWaitlist") : t("registered")}
                    </div>
                    <Button
                      onClick={handleCancel}
                      disabled={isPending}
                      variant="outline"
                      className="w-full bg-transparent border-white/10 text-white hover:bg-white/10"
                    >
                      <X className="mr-1.5 h-4 w-4" />
                      {t("cancelRegistration")}
                    </Button>
                  </div>
                ) : event.registration_url ? (
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      type="button"
                      className="w-full bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium"
                    >
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                      {t("registerNow")}
                    </Button>
                  </a>
                ) : (
                  <Button
                    onClick={handleRegister}
                    disabled={isPending}
                    className="w-full bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium"
                  >
                    {isFull ? t("joinWaitlist") : t("registerNow")}
                  </Button>
                )}
              </div>
            )}

            {/* Exhibitor self-registration (company owners) */}
            {exhibitorOrgs.length > 0 && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Store className="h-4 w-4 text-[var(--brand)]" />
                  {t("exhibitingTitle")}
                </div>
                {exhibitorOrgs.map((org) => {
                  const on = exhibitingOrgIds.includes(org.id);
                  return (
                    <Button
                      key={org.id}
                      type="button"
                      onClick={() => handleToggleExhibit(org.id)}
                      disabled={isExhibitPending}
                      className={
                        on
                          ? "w-full bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium"
                          : "w-full bg-transparent border border-white/10 text-white hover:bg-white/10"
                      }
                    >
                      {on ? (
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      ) : (
                        <Plus className="mr-1.5 h-4 w-4" />
                      )}
                      {exhibitorOrgs.length > 1
                        ? on
                          ? t("exhibitingAsName", { name: org.name })
                          : org.name
                        : on
                          ? t("youreExhibiting")
                          : t("imExhibiting")}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dedicated event social pages */}
          {(() => {
            const socials = [
              { url: event.linkedin_url, Icon: Linkedin, label: "LinkedIn", hover: "hover:text-[#0A66C2]" },
              { url: event.x_url, Icon: Twitter, label: "X", hover: "hover:text-white" },
              { url: event.facebook_url, Icon: Facebook, label: "Facebook", hover: "hover:text-[#1877F2]" },
              { url: event.instagram_url, Icon: Instagram, label: "Instagram", hover: "hover:text-[#E4405F]" },
              { url: event.youtube_url, Icon: Youtube, label: "YouTube", hover: "hover:text-[#FF0000]" },
            ].filter((s) => !!s.url);
            if (socials.length === 0) return null;
            return (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {t("followThisEvent")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {socials.map(({ url, Icon, label, hover }) => (
                    <a
                      key={label}
                      href={url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`rounded-lg bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 ${hover}`}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
        </aside>
      </div>
    </div>
  );
}
