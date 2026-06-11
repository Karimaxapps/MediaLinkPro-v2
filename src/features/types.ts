export type ActionState = {
    message?: string;
    error?: string;
    success?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- open-ended action payloads (e.g. `data`) are read as typed values by callers
    [key: string]: any;
};

/**
 * Convert a thrown/returned error into a SAFE, user-facing message.
 *
 * Raw Postgres/PostgREST `error.message` strings leak schema details (column
 * and constraint names, internal structure) to untrusted clients. Use this for
 * any error surfaced to end users: it logs the full error server-side and
 * returns a generic message, mapping a few well-known, safe-to-surface cases.
 *
 * Trusted admin-only actions may still surface `error.message` directly for
 * debuggability.
 */
export function toUserError(error: unknown, fallback = "Something went wrong. Please try again."): string {
    // Log the real error for server-side diagnosis.
    console.error("[action error]", error);

    const code = (error as { code?: string } | null)?.code;
    switch (code) {
        case "23505":
            return "That already exists.";
        case "23503":
            return "That action references something that no longer exists.";
        case "23514":
            return "Some of the values provided aren't allowed.";
        case "42501":
            return "You don't have permission to do that.";
        default:
            return fallback;
    }
}
