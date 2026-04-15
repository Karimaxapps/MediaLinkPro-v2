"use client";

import { useState, useTransition, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Plus, Send, ChevronLeft, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    getProductDiscussions,
    getDiscussionPosts,
    createDiscussion,
    createDiscussionReply,
    type DiscussionThread,
    type DiscussionPost,
} from "../server/actions";

export function ProductDiscussions({
    productId,
    canPost,
}: {
    productId: string;
    canPost: boolean;
}) {
    const [threads, setThreads] = useState<DiscussionThread[] | null>(null);
    const [activeThread, setActiveThread] = useState<DiscussionThread | null>(null);
    const [posts, setPosts] = useState<DiscussionPost[]>([]);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newBody, setNewBody] = useState("");
    const [replyBody, setReplyBody] = useState("");
    const [isPending, startTransition] = useTransition();

    // Load threads initially
    useEffect(() => {
        getProductDiscussions(productId).then(setThreads);
    }, [productId]);

    const openThread = (thread: DiscussionThread) => {
        setActiveThread(thread);
        setPosts([]);
        getDiscussionPosts(thread.id).then(setPosts);
    };

    const handleCreate = () => {
        startTransition(async () => {
            const result = await createDiscussion(productId, newTitle, newBody);
            if (!result.success) {
                toast.error(result.error ?? "Failed to create");
                return;
            }
            toast.success("Discussion started");
            setNewTitle("");
            setNewBody("");
            setShowNewForm(false);
            const updated = await getProductDiscussions(productId);
            setThreads(updated);
        });
    };

    const handleReply = () => {
        if (!activeThread) return;
        startTransition(async () => {
            const result = await createDiscussionReply(activeThread.id, replyBody);
            if (!result.success) {
                toast.error(result.error ?? "Failed to reply");
                return;
            }
            setReplyBody("");
            const updated = await getDiscussionPosts(activeThread.id);
            setPosts(updated);
        });
    };

    // Detail view
    if (activeThread) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => setActiveThread(null)}
                    className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to discussions
                </button>
                <div>
                    <h3 className="text-xl font-bold text-white">{activeThread.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Started by {activeThread.author?.full_name ?? activeThread.author?.username ?? "User"}
                        {activeThread.created_at && (
                            <> • {formatDistanceToNow(new Date(activeThread.created_at), { addSuffix: true })}</>
                        )}
                    </p>
                </div>

                <div className="space-y-3">
                    {posts.length === 0 ? (
                        <div className="text-sm text-gray-500 py-4">Loading...</div>
                    ) : (
                        posts.map((p) => (
                            <div key={p.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={p.author?.avatar_url ?? undefined} />
                                        <AvatarFallback className="bg-[#C6A85E] text-black text-xs">
                                            {(p.author?.full_name ?? p.author?.username ?? "U")[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white">
                                            {p.author?.full_name ?? p.author?.username ?? "Unknown"}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {p.created_at && formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-300 whitespace-pre-wrap">{p.content}</div>
                            </div>
                        ))
                    )}
                </div>

                {canPost && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                        <Textarea
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            placeholder="Write a reply..."
                            className="bg-white/5 border-white/10 min-h-[100px]"
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={handleReply}
                                disabled={isPending || !replyBody.trim()}
                                className="bg-[#C6A85E] hover:bg-[#b5975a] text-black"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Reply
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // List view
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[#C6A85E]" />
                    Discussions
                </h3>
                {canPost && !showNewForm && (
                    <Button
                        size="sm"
                        onClick={() => setShowNewForm(true)}
                        className="bg-[#C6A85E] hover:bg-[#b5975a] text-black"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        New Thread
                    </Button>
                )}
            </div>

            {showNewForm && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                    <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Thread title"
                        className="bg-white/5 border-white/10"
                    />
                    <Textarea
                        value={newBody}
                        onChange={(e) => setNewBody(e.target.value)}
                        placeholder="What would you like to discuss?"
                        className="bg-white/5 border-white/10 min-h-[120px]"
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            className="border-white/10"
                            onClick={() => {
                                setShowNewForm(false);
                                setNewTitle("");
                                setNewBody("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={isPending || !newTitle.trim() || !newBody.trim()}
                            className="bg-[#C6A85E] hover:bg-[#b5975a] text-black"
                        >
                            Create
                        </Button>
                    </div>
                </div>
            )}

            {threads === null ? (
                <div className="text-sm text-gray-500 py-4">Loading...</div>
            ) : threads.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
                    <MessageSquare className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No discussions yet.</p>
                    {canPost && (
                        <p className="text-xs text-gray-500 mt-1">Be the first to start a conversation.</p>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    {threads.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => openThread(t)}
                            className="w-full text-left rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/[0.07] transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-white truncate">{t.title}</div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <UserIcon className="h-3 w-3" />
                                            {t.author?.full_name ?? t.author?.username ?? "Unknown"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" />
                                            {t.post_count} {t.post_count === 1 ? "reply" : "replies"}
                                        </span>
                                        {t.updated_at && (
                                            <span>{formatDistanceToNow(new Date(t.updated_at), { addSuffix: true })}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
