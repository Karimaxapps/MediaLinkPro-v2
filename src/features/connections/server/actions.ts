'use server';

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { notify } from "@/features/notifications/server/notify";
import { emailTemplates } from "@/lib/email/templates";
import { checkRateLimit } from "@/lib/rate-limit";
import { isUuid } from "@/lib/utils";
import { toUserError } from "@/features/types";

// Cap how many new connection requests a single user can fire per hour. Each
// request also dispatches an email, so this doubles as an email-bomb / cost
// guard. Enforced with the durable, multi-instance limiter.
const CONNECTION_REQUESTS_PER_HOUR = 30;

export async function sendConnectionRequest(recipientId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    if (!isUuid(recipientId)) return { error: 'Invalid recipient', success: false };
    if (user.id === recipientId) return { error: 'Cannot connect to yourself', success: false };

    const allowed = await checkRateLimit(
        `conn-req:${user.id}`,
        CONNECTION_REQUESTS_PER_HOUR,
        60 * 60 * 1000
    );
    if (!allowed) {
        return {
            error: "You're sending connection requests too quickly. Please try again later.",
            success: false,
        };
    }

    const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .single();

    const senderName = senderProfile?.full_name || senderProfile?.username || 'Someone';

    const { error } = await supabase
        .from('connections')
        .insert({
            requester_id: user.id,
            recipient_id: recipientId,
            status: 'pending'
        });

    if (error) {
        return { error: toUserError(error, "Failed to send request."), success: false };
    }

    // Create notification + optional email via central helper
    const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/profiles/${senderProfile?.username ?? user.id}`;
    const tmpl = emailTemplates.connectionRequest(senderName, profileUrl);
    await notify({
        userId: recipientId,
        type: "connection_request",
        title: "New Connection Request",
        message: `${senderName} has sent you a connection request.`,
        data: { requester_id: user.id, username: senderProfile?.username },
        email: { subject: tmpl.subject, html: tmpl.html },
    });

    revalidatePath('/profiles');
    revalidatePath('/connect');
    return { success: true, message: 'Connection request sent!' };
}

export async function cancelConnectionRequest(recipientId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    const { error } = await supabase
        .from('connections')
        .delete()
        .eq('requester_id', user.id)
        .eq('recipient_id', recipientId)
        .eq('status', 'pending');

    if (error) {
        console.error("Error cancelling connection request:", error);
        return { error: 'Failed to cancel request', success: false };
    }

    // Attempt to delete the associated notification using admin client
    const adminSupabase = createAdminClient();
    await adminSupabase
        .from('notifications')
        .delete()
        .eq('user_id', recipientId)
        .eq('type', 'connection_request')
        .contains('data', { requester_id: user.id });

    revalidatePath('/profiles');
    revalidatePath('/connect');
    return { success: true, message: 'Connection request cancelled' };
}

export async function acceptConnectionRequest(requestId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    // Only the recipient of the request may accept it. Scoping the WHERE
    // clause to recipient_id prevents an attacker from accepting requests
    // addressed to other users.
    const { data, error } = await supabase
        .from('connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .select('id');

    if (error) return { error: 'Failed to accept request', success: false };
    if (!data || data.length === 0) {
        return { error: 'Request not found or you are not the recipient', success: false };
    }

    revalidatePath('/profiles');
    return { success: true, message: 'Connection accepted!' };
}

export async function rejectConnectionRequest(requestId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    // Only the recipient may reject a pending request.
    const { data, error } = await supabase
        .from('connections')
        .delete()
        .eq('id', requestId)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .select('id');

    if (error) return { error: 'Failed to reject request', success: false };
    if (!data || data.length === 0) {
        return { error: 'Request not found or you are not the recipient', success: false };
    }

    revalidatePath('/profiles');
    return { success: true, message: 'Request rejected' };
}

export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected';

export type ConnectionStatusData = {
    status: ConnectionStatus;
    requestId?: string;
}

export async function getConnectionStatus(targetUserId: string): Promise<ConnectionStatusData> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 'none' };

    // Validate before interpolating into the PostgREST .or() filter string.
    if (!isUuid(targetUserId)) return { status: 'none' };

    const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},recipient_id.eq.${user.id})`)
        .single();

    if (error || !data) return { status: 'none' };

    if (data.status === 'accepted') return { status: 'connected', requestId: data.id };

    if (data.status === 'pending') {
        if (data.requester_id === user.id) return { status: 'pending_sent', requestId: data.id };
        return { status: 'pending_received', requestId: data.id };
    }

    return { status: 'none' };
}

export async function getConnectionsCount(userId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    if (!isUuid(userId)) return 0;

    const { count, error } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

    if (error) return 0;
    return count || 0;
}
