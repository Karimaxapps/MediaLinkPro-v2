"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function fetchUnreadMessageCount() {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return 0
    }

    // 1. Get all conversations the user is a part of (personal or as an org)
    // We can just rely on the existing fetchConversations logic, or write a count query
    // To be efficient, let's just use the `conversations` function.
    const { data: convs } = await supabase
        .from("conversations")
        .select(`
            id
        `)

    if (!convs || convs.length === 0) return 0;

    // 2. Count unread messages in those conversations where the sender is not the user
    // (In a true production app with complex RLS, this might be simpler if RLS allowed direct message counting, 
    // but we can query explicitly)
    const convIds = convs.map(c => c.id)

    const { count, error } = await supabase
        .from("messages")
        .select('*', { count: 'exact', head: true })
        .in("conversation_id", convIds)
        .eq("is_read", false)
        .neq("sender_profile_id", user.id)

    if (error) {
        console.error("Error fetching unread count:", error)
        return 0
    }

    return count || 0
}

export async function fetchConversations() {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // First verify user is authenticated
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { conversations: [], error: "Not authenticated" }
    }

    // We need to fetch conversations where the user is a participant
    // Or their organization is a participant
    const { data, error } = await supabase
        .from("conversations")
        .select(`
      id,
      updated_at,
      participants:conversation_participants(
        id,
        profile_id,
        organization_id,
        profile:profiles(id, full_name, avatar_url, username),
        organization:organizations(id, name, slug, logo_url)
      ),
      last_message:messages(
        id,
        content,
        created_at,
        is_read,
        sender_profile_id,
        sender_organization_id
      )
    `)
        // Order by updated_at on the conversations table
        .order("updated_at", { ascending: false })
        // Limit last_message to 1
        // @ts-ignore - complex nested limit
        .limit(1, { foreignTable: "messages" })
        .order('created_at', { ascending: false, foreignTable: "messages" })

    if (error) {
        console.error("Error fetching conversations:", error)
        return { conversations: [], error: error.message }
    }

    return { conversations: data, error: null }
}

export async function fetchMessages(conversationId: string) {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    const { data, error } = await supabase
        .from("messages")
        .select(`
      id,
      content,
      created_at,
      is_read,
      sender_profile_id,
      sender_organization_id,
      profile:profiles(id, full_name, avatar_url, username),
      organization:organizations(id, name, slug, logo_url)
    `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

    if (error) {
        console.error("Error fetching messages:", error)
        return { messages: [], error: error.message }
    }

    // Mark all unread messages in this conversation not sent by me as read
    // (We'll do this in the background, or directly here)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        // Fire and forget updating read status
        // Only mark messages where we are not the sender
        supabase.from("messages")
            .update({ is_read: true })
            .eq("conversation_id", conversationId)
            .neq("sender_profile_id", user.id)
            .eq("is_read", false)
            .then()
    }

    return { messages: data, error: null }
}

export async function sendMessage(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    const conversationId = formData.get("conversationId") as string
    const content = formData.get("content") as string
    const senderOrganizationId = formData.get("senderOrganizationId") as string | null

    if (!conversationId || !content) {
        return { error: "Missing required fields" }
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        content,
        sender_profile_id: user.id,
        sender_organization_id: senderOrganizationId || null,
    })

    if (error) {
        console.error("Error sending message:", error)
        return { error: error.message }
    }

    // also bump conversation updated_at
    await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)

    revalidatePath("/messages")
    return { success: true }
}

// Start a new conversation, or return existing one
export async function startConversation(targetProfileId?: string, targetOrganizationId?: string, actingAsOrganizationId?: string) {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    if (!targetProfileId && !targetOrganizationId) {
        return { error: "Must specify a target user or organization" }
    }

    // 1. Check if a direct conversation already exists
    // Find conversations where the current user/org is a participant
    const myField = actingAsOrganizationId ? "organization_id" : "profile_id"
    const myId = actingAsOrganizationId || user.id

    const targetField = targetOrganizationId ? "organization_id" : "profile_id"
    const targetId = targetOrganizationId || targetProfileId

    const { data: myConversations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq(myField, myId)

    if (myConversations && myConversations.length > 0) {
        const myConvIds = myConversations.map(c => c.conversation_id)

        // Check if the target is in any of these conversations
        const { data: matchingConversations } = await supabase
            .from("conversation_participants")
            .select("conversation_id")
            .in("conversation_id", myConvIds)
            .eq(targetField, targetId)

        if (matchingConversations && matchingConversations.length > 0) {
            // Found existing conversation, return it
            return { conversationId: matchingConversations[0].conversation_id, success: true }
        }
    }

    // We'll pre-generate a UUID to avoid insert->select RLS issues when the participant isn't added yet
    const newConversationId = crypto.randomUUID()

    const { error: convError } = await supabase
        .from("conversations")
        .insert({ id: newConversationId })

    if (convError) {
        console.error("Error creating conversation:", convError)
        return { error: convError.message || "Failed to create conversation" }
    }

    // 2. Add participants
    // Participant 1: The current user (or their organization)
    const p1 = actingAsOrganizationId
        ? { conversation_id: newConversationId, organization_id: actingAsOrganizationId }
        : { conversation_id: newConversationId, profile_id: user.id }

    // Participant 2: The target  
    const p2 = targetOrganizationId
        ? { conversation_id: newConversationId, organization_id: targetOrganizationId }
        : { conversation_id: newConversationId, profile_id: targetProfileId }

    const { error: partError } = await supabase
        .from("conversation_participants")
        .insert([p1, p2])

    if (partError) {
        console.error("Error adding participants:", partError)
        return { error: partError.message }
    }

    revalidatePath("/messages")
    return { conversationId: newConversationId, success: true }
}
