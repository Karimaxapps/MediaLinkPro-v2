// Minimal Expo Push API client. Batches requests (100 messages per call,
// per Expo's documented limit). Returns counts so callers can persist them.

export type ExpoPushMessage = {
    to: string;
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
    sound?: "default" | null;
    badge?: number;
    channelId?: string;
};

type ExpoPushResult = {
    sent: number;
    failed: number;
    invalidTokens: string[];
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_SIZE = 100;

export async function sendExpoPush(messages: ExpoPushMessage[]): Promise<ExpoPushResult> {
    const result: ExpoPushResult = { sent: 0, failed: 0, invalidTokens: [] };
    if (messages.length === 0) return result;

    const accessToken = process.env.EXPO_ACCESS_TOKEN;

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
        const batch = messages.slice(i, i + BATCH_SIZE);
        try {
            const res = await fetch(EXPO_PUSH_URL, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Accept-Encoding": "gzip, deflate",
                    "Content-Type": "application/json",
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify(batch),
            });

            if (!res.ok) {
                result.failed += batch.length;
                console.error("[expo-push] batch failed:", res.status, await res.text());
                continue;
            }

            const json = (await res.json()) as {
                data?: Array<{
                    status: "ok" | "error";
                    id?: string;
                    message?: string;
                    details?: { error?: string };
                }>;
            };

            json.data?.forEach((ticket, idx) => {
                if (ticket.status === "ok") {
                    result.sent += 1;
                } else {
                    result.failed += 1;
                    if (ticket.details?.error === "DeviceNotRegistered") {
                        result.invalidTokens.push(batch[idx].to);
                    }
                }
            });
        } catch (err) {
            result.failed += batch.length;
            console.error("[expo-push] network error:", err);
        }
    }

    return result;
}
