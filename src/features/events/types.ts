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
    max_attendees: number | null;
    registration_count: number;
    interest_count: number;
    registration_url: string | null;
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

export type EventSpeaker = {
    id: string;
    event_id: string;
    user_id: string | null;
    name: string;
    role: string | null;
    bio: string | null;
    avatar_url: string | null;
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
    conference: "Conference",
    webinar: "Webinar",
    workshop: "Workshop",
    meetup: "Meetup",
    trade_show: "Trade Show",
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
    conference: "#C6A85E",
    webinar: "#135bec",
    workshop: "#10b981",
    meetup: "#f59e0b",
    trade_show: "#8b5cf6",
};
