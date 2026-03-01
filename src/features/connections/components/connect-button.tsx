"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
    ConnectionStatus
} from "@/features/connections/server/actions";
import { UserPlus, UserCheck, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ConnectButtonProps {
    targetUserId: string;
    initialStatus: ConnectionStatus;
    requestId?: string;
    className?: string;
}

export function ConnectButton({ targetUserId, initialStatus, requestId, className }: ConnectButtonProps) {
    const [status, setStatus] = useState<ConnectionStatus>(initialStatus);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleConnect = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if in a link card
        setIsLoading(true);

        try {
            if (status === 'none') {
                const result = await sendConnectionRequest(targetUserId);
                if (result.success) {
                    setStatus('pending_sent');
                    toast.success("Connection request sent!");
                } else {
                    toast.error(result.error);
                }
            } else if (status === 'pending_received') {
                // Ideally this would be two buttons (Accept/Reject), but for simplicity:
                // We'll handle Accept here, or maybe show a dropdown?
                // For this button, let's just make it Accept.
                // Rejection logic should probably be in a specific "Requests" UI.
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
            router.refresh();
        }
    };

    if (status === 'connected') {
        return (
            <Button variant="outline" size="sm" className={`gap-2 border-[#C6A85E]/50 text-[#C6A85E] hover:bg-[#C6A85E]/10 ${className}`} disabled>
                <UserCheck className="h-4 w-4" />
                Connected
            </Button>
        );
    }

    if (status === 'pending_sent') {
        const handleCancel = async (e: React.MouseEvent) => {
            e.preventDefault();
            setIsLoading(true);
            try {
                const result = await cancelConnectionRequest(targetUserId);
                if (result.success) {
                    setStatus('none');
                    toast.success("Request cancelled");
                } else {
                    toast.error(result.error || "Failed to cancel request");
                }
            } catch (error) {
                toast.error("An error occurred");
            } finally {
                setIsLoading(false);
                router.refresh();
            }
        };

        return (
            <Button
                variant="outline"
                size="sm"
                className={`gap-2 text-gray-400 border-white/10 hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/10 group ${className}`}
                onClick={handleCancel}
                disabled={isLoading}
            >
                <Clock className="h-4 w-4 group-hover:hidden" />
                <X className="h-4 w-4 hidden group-hover:block" />
                <span className="group-hover:hidden">{isLoading ? "Cancelling..." : "Pending"}</span>
                <span className="hidden group-hover:block">Cancel</span>
            </Button>
        );
    }

    if (status === 'pending_received') {
        const handleAccept = async (e: React.MouseEvent) => {
            e.preventDefault();
            if (!requestId) {
                toast.error("Request ID not found. Please refresh the page.");
                return;
            }
            setIsLoading(true);
            try {
                const result = await acceptConnectionRequest(requestId);
                if (result.success) {
                    setStatus('connected');
                    toast.success("Connection accepted!");
                } else {
                    toast.error(result.error || "Failed to accept request");
                }
            } catch (error) {
                toast.error("An error occurred");
            } finally {
                setIsLoading(false);
                router.refresh();
            }
        };

        return (
            <Button
                onClick={handleAccept}
                disabled={isLoading || !requestId}
                size="sm"
                className={`gap-2 bg-[#C6A85E] text-black hover:bg-[#B5964B] ${className}`}
            >
                <UserCheck className="h-4 w-4" />
                {isLoading ? "Accepting..." : "Accept Connection"}
            </Button>
        );
    }

    return (
        <Button
            onClick={handleConnect}
            disabled={isLoading}
            size="sm"
            className={`gap-2 bg-[#C6A85E] text-black hover:bg-[#B5964B] ${className}`}
        >
            <UserPlus className="h-4 w-4" />
            Connect
        </Button>
    );
}
