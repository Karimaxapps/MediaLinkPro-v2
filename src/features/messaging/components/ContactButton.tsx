"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageSquare, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { startConversation } from "@/features/messaging/server/actions"

interface ContactButtonProps {
    targetProfileId?: string
    targetOrganizationId?: string
    actingAsOrganizationId?: string
    variant?: "default" | "secondary" | "outline" | "ghost"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
    text?: string
}

export function ContactButton({
    targetProfileId,
    targetOrganizationId,
    actingAsOrganizationId,
    variant = "outline",
    size = "default",
    className,
    text = "Message"
}: ContactButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleContact = async () => {
        setIsLoading(true)
        const { conversationId, error } = await startConversation(
            targetProfileId,
            targetOrganizationId,
            actingAsOrganizationId
        )

        if (error) {
            toast.error("Error starting conversation: " + error)
            setIsLoading(false)
        } else if (conversationId) {
            // Navigate to messages inbox with conversation selected
            router.push(`/messages?id=${conversationId}`)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleContact}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
            )}
            {text}
        </Button>
    )
}
