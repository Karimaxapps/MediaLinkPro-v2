"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Database } from "@/types/supabase"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Send } from "lucide-react"
import { fetchConversations, fetchMessages, sendMessage } from "@/features/messaging/server/actions"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/browser"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Organization = Database["public"]["Tables"]["organizations"]["Row"]
type Message = Database["public"]["Tables"]["messages"]["Row"] & {
    profile?: Pick<Profile, "full_name" | "avatar_url" | "username"> | null
    organization?: Pick<Organization, "name" | "slug" | "logo_url"> | null
}
type ConversationNode = {
    id: string
    updated_at: string
    participants: {
        profile_id: string | null
        organization_id: string | null
        profile?: Pick<Profile, "full_name" | "avatar_url" | "username"> | null
        organization?: Pick<Organization, "name" | "slug" | "logo_url"> | null
    }[]
    last_message: {
        content: string
        created_at: string
        is_read: boolean
        sender_profile_id: string
        sender_organization_id: string | null
    }[]
}

export function MessagesClient({ userId, hasOrganization }: { userId: string, hasOrganization?: boolean }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [activeTab, setActiveTab] = useState<"personal" | "company">("personal")
    const [conversations, setConversations] = useState<ConversationNode[]>([])
    const [isLoadingConversations, setIsLoadingConversations] = useState(true)

    const [activeConversationId, setActiveConversationId] = useState<string | null>(
        searchParams.get("id") || null
    )
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)

    // Determine if the user manages any companies from the conversations
    const hasCompanyConversations = conversations.some(c =>
        c.participants.some(p => p.organization_id !== null)
    )

    useEffect(() => {
        async function loadConversations() {
            setIsLoadingConversations(true)
            const { conversations: data, error } = await fetchConversations()
            if (error) {
                toast.error(error)
            } else {
                setConversations(data as any || [])
            }
            setIsLoadingConversations(false)
        }
        loadConversations()
    }, [toast])

    useEffect(() => {
        if (!activeConversationId) return

        async function loadMessages() {
            setIsLoadingMessages(true)
            const { messages: data, error } = await fetchMessages(activeConversationId!)
            if (error) {
                toast.error(error)
            } else {
                setMessages(data as any || [])
            }
            setIsLoadingMessages(false)
        }
        loadMessages()

        const supabase = createClient()
        const channel = supabase.channel(`messages:${activeConversationId}`)
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "messages",
                filter: `conversation_id=eq.${activeConversationId}`
            }, () => {
                // When a new message arrives, just reload messages
                loadMessages()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [activeConversationId, toast])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !activeConversationId) return

        setIsSending(true)

        // Determine if we are sending as a company or personal
        // If we're viewing the "company" tab, and this conversation is a company conversation,
        // find our organization ID from the participants.
        let senderOrgId = null
        if (activeTab === "company") {
            const conv = conversations.find(c => c.id === activeConversationId)
            if (conv) {
                const myOrgParticipant = conv.participants.find(p => p.organization_id !== null)
                if (myOrgParticipant) {
                    senderOrgId = myOrgParticipant.organization_id
                }
            }
        }

        const formData = new FormData()
        formData.append("conversationId", activeConversationId)
        formData.append("content", newMessage)
        if (senderOrgId) {
            formData.append("senderOrganizationId", senderOrgId)
        }

        const { success, error } = await sendMessage(formData)

        if (error) {
            toast.error(error)
        } else {
            setNewMessage("")
            // Refresh messages
            const { messages: data } = await fetchMessages(activeConversationId)
            setMessages(data as any || [])
        }
        setIsSending(false)
    }

    // Filter and deduplicate conversations
    const seenParticipants = new Set<string>();

    let filteredConversations = conversations.filter(c => {
        const isCompanyConv = c.participants.some(p => p.organization_id !== null)

        // Hide conversations with no messages, UNLESS it's the currently active one
        const hasMessages = c.last_message && c.last_message.length > 0;
        if (!hasMessages && c.id !== activeConversationId) return false;

        // Filter by tab
        if (activeTab === "company" && !isCompanyConv) return false;
        if (activeTab === "personal" && isCompanyConv) return false;

        // Deduplicate by the "other" participant ID to fix legacy duplicate data
        const otherParticipant = c.participants.find(p => p.profile_id !== userId || (activeTab === "company" && p.organization_id))
            || c.participants[0]

        const participantKey = otherParticipant?.organization_id
            ? `org_${otherParticipant.organization_id}`
            : `user_${otherParticipant?.profile_id}`;

        if (seenParticipants.has(participantKey)) {
            // If we've already seen this participant, hide this older duplicate conversation
            // UNLESS this is the active conversation they just clicked on
            if (c.id !== activeConversationId) return false;
        }

        seenParticipants.add(participantKey);
        return true;
    })

    return (
        <div className="flex h-[calc(100vh-8rem)] min-h-[500px] overflow-hidden bg-[#1F1F1F] border border-white/10 shadow-sm rounded-[10px] text-white">
            {/* Sidebar for conversations */}
            <div className="w-[320px] md:w-[380px] border-r border-white/10 flex flex-col bg-[#1F1F1F]">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-2xl font-semibold tracking-tight text-[#C6A85E] mb-4">Inbox</h2>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-auto border-b border-white/10 rounded-none">
                            <TabsTrigger
                                value="personal"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C6A85E] data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-400 data-[state=active]:shadow-none px-0 py-2 font-medium"
                            >
                                Personal
                            </TabsTrigger>
                            <TabsTrigger
                                value="company"
                                disabled={!hasOrganization && !hasCompanyConversations && activeTab !== "company"}
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C6A85E] data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-400 disabled:opacity-50 data-[state=active]:shadow-none px-0 py-2 font-medium"
                            >
                                Company
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <ScrollArea className="flex-1 w-full">
                    <div className="flex flex-col gap-2 p-2 w-full">
                        {isLoadingConversations ? (
                            <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                        ) : filteredConversations.length === 0 ? (
                            <p className="text-center text-muted-foreground p-4">No conversations yet.</p>
                        ) : (
                            filteredConversations.map(conv => {
                                // Determine the "other" participant
                                const otherParticipant = conv.participants.find(p => p.profile_id !== userId || (activeTab === "company" && p.organization_id))
                                    || conv.participants[0]

                                const title = otherParticipant?.organization?.name || otherParticipant?.profile?.full_name || "Unknown"
                                const avatarLabel = title.charAt(0).toUpperCase()
                                const avatarUrl = otherParticipant?.organization?.logo_url || otherParticipant?.profile?.avatar_url

                                const lastMsg = conv.last_message?.[0]
                                const isUnread = lastMsg && !lastMsg.is_read && lastMsg.sender_profile_id !== userId

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => {
                                            setActiveConversationId(conv.id)
                                            router.replace(`/messages?id=${conv.id}`, { scroll: false })
                                        }}
                                        className={`w-full flex items-start gap-4 p-4 text-left transition-all border-b border-white/10 last:border-0 hover:bg-white/5 ${activeConversationId === conv.id ? "bg-white/10" : "opacity-80 hover:opacity-100"}`}
                                    >
                                        <Avatar className="h-10 w-10 border border-white/10 shadow-sm mt-1">
                                            <AvatarImage src={avatarUrl || ""} />
                                            <AvatarFallback className="bg-[#121212] text-gray-400">{avatarLabel}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex items-baseline justify-between mb-1">
                                                <p className={`text-sm truncate ${isUnread ? 'font-bold text-white' : 'font-semibold text-gray-300'}`}>{title}</p>
                                                {lastMsg && (
                                                    <span className="text-[10px] font-medium text-gray-500 whitespace-nowrap ml-2 uppercase tracking-wider">
                                                        {formatDistanceToNow(new Date(lastMsg.created_at), { addSuffix: false })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm leading-snug truncate ${isUnread ? 'text-white font-medium' : 'text-gray-400'}`}>
                                                {lastMsg?.content || "No messages"}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#121212] relative">
                {activeConversationId ? (
                    <>
                        {/* Chat header */}
                        <div className="px-6 py-5 border-b border-white/10 flex flex-shrink-0 items-center justify-between bg-[#1F1F1F] z-10 sticky top-0 shadow-sm">
                            <h3 className="font-semibold text-xl tracking-tight">Conversation</h3>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 w-full">
                            {isLoadingMessages ? (
                                <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
                            ) : messages.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    <p>No messages yet. Say hi!</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {messages.map(msg => {
                                        const isMe = msg.sender_profile_id === userId
                                        const avatarUrl = msg.organization?.logo_url || msg.profile?.avatar_url
                                        const title = msg.organization?.name || msg.profile?.full_name || "Unknown"
                                        const avatarLabel = title.charAt(0).toUpperCase()

                                        return (
                                            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                                                {!isMe && (
                                                    <Avatar className="h-8 w-8 shrink-0 mt-1">
                                                        <AvatarImage src={avatarUrl || ""} />
                                                        <AvatarFallback className="text-xs bg-[#1F1F1F] text-gray-400 border border-white/10">{avatarLabel}</AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                                    <div className="flex items-baseline gap-2 mb-1 px-1">
                                                        {!isMe && <span className="text-xs font-medium text-gray-300">{title}</span>}
                                                        <span className="text-[10px] text-gray-500">
                                                            {new Date(msg.created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className={`px-4 py-2 text-sm shadow-sm ${isMe ? "bg-[#C6A85E] text-[#121212] rounded-2xl rounded-tr-sm" : "bg-[#1F1F1F] text-white border border-white/10 rounded-2xl rounded-tl-sm"}`}>
                                                        <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Message input area */}
                        <div className="p-4 bg-[#1F1F1F] border-t border-white/10 flex-shrink-0">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3 w-full bg-[#121212] border border-white/10 rounded-xl p-1 shadow-sm focus-within:border-[#C6A85E]/50 transition-all">
                                <Input
                                    placeholder="Type your message..."
                                    className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-white placeholder:text-gray-500 text-base py-6 px-4"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    disabled={isSending}
                                    autoComplete="off"
                                />
                                <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending} className="rounded-lg h-12 w-12 shrink-0 mr-1 bg-white/10 hover:bg-white/20 text-white border-0">
                                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#121212] h-full space-y-4">
                        <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center bg-[#1F1F1F] shadow-sm">
                            <Send className="w-6 h-6 opacity-40 ml-1" />
                        </div>
                        <p className="font-medium">Select a conversation to begin</p>
                    </div>
                )}
            </div>
        </div>
    )
}
