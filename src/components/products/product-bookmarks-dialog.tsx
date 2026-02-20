"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getProductBookmarks } from "@/features/products/server/actions";
import { useEffect, useState } from "react";
import { Loader2, User, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface ProductBookmarksDialogProps {
    productId: string;
    children: React.ReactNode;
}

export function ProductBookmarksDialog({ productId, children }: ProductBookmarksDialogProps) {
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            const fetchBookmarks = async () => {
                setLoading(true);
                try {
                    const data = await getProductBookmarks(productId);
                    setBookmarks(data || []);
                } catch (error) {
                    console.error("Failed to fetch bookmarks", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchBookmarks();
        }
    }, [open, productId]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="bg-[#1C1C1C] border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-[#C6A85E]/10">
                                <Bookmark className="w-5 h-5 text-[#C6A85E]" />
                            </div>
                            <span>Bookmarked By</span>
                        </div>
                        <Badge variant="secondary" className="bg-[#C6A85E]/20 text-[#C6A85E]">
                            {bookmarks.length}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[400px] w-full pr-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[#C6A85E]" />
                        </div>
                    ) : bookmarks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center text-gray-400">
                            <p>No bookmarks yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 pt-4">
                            {bookmarks.map((bookmark) => (
                                <div key={bookmark.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Link href={`/profile/${bookmark.user?.username || bookmark.user?.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                            <Avatar className="h-9 w-9 border border-white/10">
                                                <AvatarImage src={bookmark.user?.avatar_url} />
                                                <AvatarFallback className="bg-[#C6A85E]/20 text-[#C6A85E]">
                                                    {bookmark.user?.full_name?.charAt(0) || <User className="w-4 h-4" />}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium text-white hover:underline">
                                                    {bookmark.user?.full_name || bookmark.user?.email || 'Anonymous User'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
