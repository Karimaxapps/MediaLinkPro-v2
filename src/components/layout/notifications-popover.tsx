"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Mail } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/features/notifications/server/actions";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await getUserNotifications();
            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.is_read).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false);
        }
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchNotifications();
        // Optional: Set up polling or subscription here for real-time updates
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            const result = await markNotificationAsRead(id);
            if (result.success) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, is_read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            toast.error("Failed to mark as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const result = await markAllNotificationsAsRead();
            if (result.success) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
                toast.success("All marked as read");
            }
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    };

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5 relative">
                <Bell className="h-5 w-5" />
            </Button>
        );
    }

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) fetchNotifications();
        }}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5 relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[#C6A85E] rounded-full border border-[#1F1F1F]" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-[#1F1F1F] border-white/10 text-white" align="end">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h4 className="font-semibold text-white">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 text-xs text-[#C6A85E] hover:text-[#B5964A] hover:bg-transparent"
                            onClick={handleMarkAllAsRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-500 gap-2">
                            <Bell className="h-8 w-8 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex flex-col gap-1 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${!notification.is_read ? 'bg-white/[0.02]' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {notification.type === 'demo_request' && (
                                                <div className="bg-[#C6A85E]/10 p-1.5 rounded-full shrink-0">
                                                    <Mail className="h-3 w-3 text-[#C6A85E]" />
                                                </div>
                                            )}
                                            <p className={`text-sm font-medium ${!notification.is_read ? 'text-white' : 'text-gray-400'}`}>
                                                {notification.title}
                                            </p>
                                        </div>
                                        <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                            {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 pl-8 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    {!notification.is_read && (
                                        <div className="flex justify-end mt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-[10px] text-gray-500 hover:text-white"
                                                onClick={() => handleMarkAsRead(notification.id)}
                                            >
                                                Mark read
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
