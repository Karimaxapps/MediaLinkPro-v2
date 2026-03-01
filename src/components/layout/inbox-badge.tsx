"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchUnreadMessageCount } from "@/features/messaging/server/actions"
import { createClient } from "@/lib/supabase/browser"

export function InboxBadge() {
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        // Initial fetch
        const getCount = async () => {
            const count = await fetchUnreadMessageCount()
            setUnreadCount(count)
        }
        getCount()

        // Set up real-time listener for new messages globally
        // This is a simple global listener. It will trigger a re-count whenever any message is inserted
        // that belongs to this user's conversations.
        const supabase = createClient()
        const channel = supabase.channel('global-messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                () => {
                    getCount()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <Link href="/messages">
            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white hover:bg-white/5">
                <Inbox className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </Button>
        </Link>
    )
}
