'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function sendConnectionRequest(recipientId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    if (user.id === recipientId) return { error: 'Cannot connect to yourself', success: false };

    const { error } = await supabase
        .from('connections')
        .insert({
            requester_id: user.id,
            recipient_id: recipientId,
            status: 'pending'
        });

    if (error) {
        console.error("Error sending connection request:", error);
        return { error: 'Failed to send request', success: false };
    }

    revalidatePath('/profiles');
    revalidatePath('/connect');
    return { success: true, message: 'Connection request sent!' };
}

export async function acceptConnectionRequest(requestId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

    if (error) return { error: 'Failed to accept request', success: false };

    revalidatePath('/profiles');
    return { success: true, message: 'Connection accepted!' };
}

export async function rejectConnectionRequest(requestId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', requestId);

    if (error) return { error: 'Failed to reject request', success: false };

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

    const { count, error } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

    if (error) return 0;
    return count || 0;
}
