export type EventType = "conference" | "webinar" | "workshop" | "meetup" | "trade_show";
export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type RegistrationStatus = "registered" | "waitlisted" | "cancelled";
export type EventInterestType = "going" | "maybe";

export type EventInterest = {
    id: string;
    event_id: string;
    user_id: string;
    interest: EventInterestType;
    created_at: string;
    updated_at: string;
    profiles?: {
        id: string;
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
    };
};

export type Event = {
    id: string;
    organization_id: string;
    title: string;
    slug: string;
    description: string | null;
    event_type: EventType;
    status: EventStatus;
    start_date: string;
    end_date: string;
    location: string | null;
    is_online: boolean;
    online_url: string | null;
    cover_image_url: string | null;
    logo_url: string | null;
    promo_video_url: string | null;
    max_attendees: number | null;
    registration_count: number;
    interest_count: number;
    registration_url: string | null;
    website_url?: string | null;
    linkedin_url?: string | null;
    x_url?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    tiktok_url?: string | null;
    youtube_url?: string | null;
    created_at: string;
    updated_at: string;
    organizations?: {
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
    };
};

export type EventRegistration = {
    id: string;
    event_id: string;
    user_id: string;
    status: RegistrationStatus;
    registered_at: string;
    profiles?: {
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
    };
};

export type EventEdition = {
    id: string;
    event_id: string;
    label: string | null;
    start_date: string;
    end_date: string;
    location: string | null;
    venue_name: string | null;
    city: string | null;
    country: string | null;
    registration_url: string | null;
    created_at: string;
    updated_at: string;
};

export type EventSpeaker = {
    id: string;
    event_id: string;
    user_id: string | null;
    name: string;
    role: string | null;
    bio: string | null;
    avatar_url: string | null;
};

// ─── Exhibitors ───────────────────────────────────
// A company's participation in an event as an exhibitor (distinct from the
// event host org and from attendee registrations).

export type ExhibitorEvent = {
    id: string;
    title: string;
    slug: string;
    logo_url: string | null;
    cover_image_url: string | null;
};

export type EventExhibitor = {
    id: string;
    event_id: string;
    organization_id: string;
    created_by: string | null;
    source: "self" | "import";
    created_at: string;
    organizations?: {
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        country: string | null;
    };
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
    conference: "Conference",
    webinar: "Webinar",
    workshop: "Workshop",
    meetup: "Meetup",
    trade_show: "Trade Show",
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
    conference: "var(--brand)",
    webinar: "var(--brand-secondary)",
    workshop: "#10b981",
    meetup: "#f59e0b",
    trade_show: "#8b5cf6",
};
