import Link from "next/link";
import Image from "@/components/ui/safe-image";
import { cn } from "@/lib/utils";
import type { ExhibitorEvent } from "@/features/events/types";

interface ExhibitorLogosProps {
  events: Pick<ExhibitorEvent, "title" | "slug" | "logo_url">[];
  size?: "sm" | "md";
  /** When true, each logo links to its event page. Default true. */
  linked?: boolean;
  className?: string;
}

const sizeClass = {
  sm: "h-6 w-6",
  md: "h-9 w-9",
};

const textSizeClass = {
  sm: "h-6 px-1.5 text-[10px]",
  md: "h-9 px-2.5 text-xs",
};

/**
 * Row of event-organizer logos for the industry events a company exhibits at
 * (NAB, IBC, Inter-BEE …). Falls back to a labelled chip when an event has no
 * logo. Returns null when the company exhibits at nothing.
 */
export function ExhibitorLogos({
  events,
  size = "sm",
  linked = true,
  className,
}: ExhibitorLogosProps) {
  if (!events || events.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {events.map((event) => {
        const inner = event.logo_url ? (
          <span
            className={cn(
              "flex items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/5",
              sizeClass[size]
            )}
            title={event.title}
          >
            <Image
              src={event.logo_url}
              alt={event.title}
              width={size === "md" ? 36 : 24}
              height={size === "md" ? 36 : 24}
              className="h-full w-full object-contain"
            />
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md border border-white/10 bg-white/5 font-medium text-gray-300",
              textSizeClass[size]
            )}
            title={event.title}
          >
            {event.title}
          </span>
        );

        if (!linked) {
          return (
            <span key={event.slug} aria-label={event.title}>
              {inner}
            </span>
          );
        }

        return (
          <Link
            key={event.slug}
            href={`/events/${event.slug}`}
            aria-label={event.title}
            className="transition-opacity hover:opacity-80"
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
