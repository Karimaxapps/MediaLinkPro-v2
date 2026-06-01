"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
    CheckCircle,
    XCircle,
    Loader2,
    ExternalLink,
    Building2,
    Package,
    GitMerge,
    UserPlus,
    MapPin,
    Send,
    MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { resolveOwnershipRequest } from "@/features/admin/server/actions";
import {
    resolveOrgClaimAction,
    sendClaimReplyToRequester,
} from "@/features/organizations/server/claim-actions";
import type { AdminOwnershipRequest } from "@/features/ownership-requests/types";

interface Props {
    requests: AdminOwnershipRequest[];
    readOnly?: boolean;
}

type DialogState = {
    open: boolean;
    requestId: string;
    contentType: AdminOwnershipRequest["content_type"];
    decision: "approved" | "rejected";
    mode?: "adopt" | "merge";
    targetName: string;
    actorName: string;
};

export function OwnershipRequestsClient({ requests, readOnly = false }: Props) {
    const [tab, setTab] = useState<"all" | "product" | "organization">("all");
    const [dialogState, setDialogState] = useState<DialogState | null>(null);
    const [adminNote, setAdminNote] = useState("");
    const [isPending, startTransition] = useTransition();
    const [detailReq, setDetailReq] = useState<AdminOwnershipRequest | null>(null);

    const filtered = useMemo(() => {
        if (tab === "all") return requests;
        return requests.filter((r) => r.content_type === tab);
    }, [requests, tab]);

    const openDialog = (state: Omit<DialogState, "open">) => {
        setAdminNote("");
        setDialogState({ ...state, open: true });
    };

    const handleResolve = () => {
        if (!dialogState) return;
        startTransition(async () => {
            const result =
                dialogState.contentType === "organization"
                    ? await resolveOrgClaimAction(
                          dialogState.requestId,
                          dialogState.decision,
                          dialogState.mode ?? null,
                          adminNote || undefined
                      )
                    : await resolveOwnershipRequest(
                          dialogState.requestId,
                          dialogState.decision,
                          adminNote || undefined
                      );
            if (result.success) {
                toast.success(
                    dialogState.decision === "approved"
                        ? "Approved."
                        : "Claim rejected."
                );
                setDialogState(null);
            } else {
                toast.error(result.error ?? "Action failed.");
            }
        });
    };

    return (
        <>
            <div className="flex gap-2 text-sm">
                {(
                    [
                        { id: "all", label: "All" },
                        { id: "product", label: "Products" },
                        { id: "organization", label: "Companies" },
                    ] as const
                ).map((t) => {
                    const count =
                        t.id === "all"
                            ? requests.length
                            : requests.filter((r) => r.content_type === t.id).length;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-3 py-1.5 rounded-md border transition-colors ${
                                tab === t.id
                                    ? "border-[var(--brand)]/50 bg-[var(--brand)]/10 text-[var(--brand)]"
                                    : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                            }`}
                        >
                            {t.label}
                            <span className="ml-1.5 text-xs text-gray-500">({count})</span>
                        </button>
                    );
                })}
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-500 text-sm">
                    No requests here.
                </div>
            ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                                <th className="text-left p-4 font-medium">Target</th>
                                <th className="text-left p-4 font-medium">Requester</th>
                                <th className="text-left p-4 font-medium">Message</th>
                                <th className="text-left p-4 font-medium">Date</th>
                                <th className="text-left p-4 font-medium">Status</th>
                                {!readOnly && (
                                    <th className="text-right p-4 font-medium">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((req) => {
                                const isOrg = req.content_type === "organization";
                                const targetName = isOrg
                                    ? req.stub_org_name ?? "Unknown stub"
                                    : req.product_name;
                                const targetSlug = isOrg
                                    ? req.stub_org_slug ?? ""
                                    : req.product_slug;
                                const targetHref = isOrg
                                    ? `/companies/${targetSlug}`
                                    : `/products/${targetSlug}`;
                                const requesterLabel = isOrg
                                    ? req.requesting_user_name ?? "Unknown user"
                                    : req.requesting_org_name;
                                const hasExistingOrg = isOrg && !!req.requesting_org_id;

                                return (
                                    <tr
                                        key={req.id}
                                        onClick={() => setDetailReq(req)}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <td className="p-4">
                                            <a
                                                href={targetHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-2 text-white hover:text-[var(--brand)] transition-colors font-medium text-sm"
                                            >
                                                {isOrg ? (
                                                    <Building2 className="h-4 w-4 shrink-0 text-gray-500" />
                                                ) : (
                                                    <Package className="h-4 w-4 shrink-0 text-gray-500" />
                                                )}
                                                {targetName}
                                                <ExternalLink className="h-3 w-3 shrink-0 text-gray-500" />
                                            </a>
                                            <Badge
                                                variant="outline"
                                                className={`mt-1 text-[10px] h-5 ${
                                                    isOrg
                                                        ? "border-[var(--brand)]/40 text-[var(--brand)] bg-[var(--brand)]/10"
                                                        : "border-blue-500/40 text-blue-300 bg-blue-500/10"
                                                }`}
                                            >
                                                {isOrg ? "Company claim" : "Product claim"}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-200">{requesterLabel}</div>
                                            {isOrg && req.requesting_org_name && req.requesting_org_id && (
                                                <a
                                                    href={`/companies/${req.requesting_org_slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs text-gray-500 hover:text-[var(--brand)]"
                                                >
                                                    Owns: {req.requesting_org_name}
                                                </a>
                                            )}
                                            {isOrg && !hasExistingOrg && (
                                                <div className="text-xs text-gray-500">
                                                    No existing company
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 max-w-[240px]">
                                            <p
                                                className="text-sm text-gray-400 truncate"
                                                title={req.message ?? ""}
                                            >
                                                {req.message || (
                                                    <span className="text-gray-600 italic">No message</span>
                                                )}
                                            </p>
                                            {req.admin_note && (
                                                <p
                                                    className="text-xs text-gray-500 mt-1 truncate"
                                                    title={req.admin_note}
                                                >
                                                    Note: {req.admin_note}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                            {formatDistanceToNow(new Date(req.created_at), {
                                                addSuffix: true,
                                            })}
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        {!readOnly && req.status === "pending" && (
                                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex gap-2 justify-end flex-wrap">
                                                    {isOrg && hasExistingOrg && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                openDialog({
                                                                    requestId: req.id,
                                                                    contentType: req.content_type,
                                                                    decision: "approved",
                                                                    mode: "merge",
                                                                    targetName,
                                                                    actorName: requesterLabel,
                                                                })
                                                            }
                                                            className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold gap-1 h-8 px-3"
                                                        >
                                                            <GitMerge className="h-3.5 w-3.5" />
                                                            Merge
                                                        </Button>
                                                    )}
                                                    {isOrg && !hasExistingOrg && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                openDialog({
                                                                    requestId: req.id,
                                                                    contentType: req.content_type,
                                                                    decision: "approved",
                                                                    mode: "adopt",
                                                                    targetName,
                                                                    actorName: requesterLabel,
                                                                })
                                                            }
                                                            className="bg-green-600 hover:bg-green-500 text-white gap-1 h-8 px-3"
                                                        >
                                                            <UserPlus className="h-3.5 w-3.5" />
                                                            Grant ownership
                                                        </Button>
                                                    )}
                                                    {!isOrg && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                openDialog({
                                                                    requestId: req.id,
                                                                    contentType: req.content_type,
                                                                    decision: "approved",
                                                                    targetName,
                                                                    actorName: requesterLabel,
                                                                })
                                                            }
                                                            className="bg-green-600 hover:bg-green-500 text-white gap-1 h-8 px-3"
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                            Approve
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openDialog({
                                                                requestId: req.id,
                                                                contentType: req.content_type,
                                                                decision: "rejected",
                                                                targetName,
                                                                actorName: requesterLabel,
                                                            })
                                                        }
                                                        className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400 gap-1 h-8 px-3"
                                                    >
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </td>
                                        )}
                                        {!readOnly && req.status !== "pending" && <td className="p-4" />}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {dialogState && (
                <Dialog
                    open={dialogState.open}
                    onOpenChange={(open) => !open && setDialogState(null)}
                >
                    <DialogContent className="bg-[#0B0F14] border-white/10 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle
                                className={
                                    dialogState.decision === "approved"
                                        ? "text-green-400"
                                        : "text-red-400"
                                }
                            >
                                {dialogState.decision === "approved"
                                    ? dialogState.contentType === "organization"
                                        ? dialogState.mode === "merge"
                                            ? "Merge stub into existing company"
                                            : "Grant company ownership"
                                        : "Approve Ownership Transfer"
                                    : "Reject Claim"}
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                                {dialogState.decision === "approved"
                                    ? dialogState.contentType === "organization"
                                        ? dialogState.mode === "merge"
                                            ? `Merge "${dialogState.targetName}" into ${dialogState.actorName}'s existing company. Blank fields fill in, old slug 301-redirects.`
                                            : `Make ${dialogState.actorName} the owner of "${dialogState.targetName}".`
                                        : `Transfer ownership of "${dialogState.targetName}" to ${dialogState.actorName}. All other pending claims auto-rejected.`
                                    : `Reject the claim from ${dialogState.actorName} for "${dialogState.targetName}".`}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">
                                Admin note{" "}
                                <span className="text-gray-500">(optional, sent to claimant)</span>
                            </label>
                            <Textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="e.g. Welcome aboard! / Please verify your company ownership first."
                                className="h-24 resize-none bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[var(--brand)] focus-visible:border-[var(--brand)]"
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setDialogState(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleResolve}
                                disabled={isPending}
                                className={
                                    dialogState.decision === "approved"
                                        ? "bg-green-600 hover:bg-green-500 text-white font-semibold"
                                        : "bg-red-700 hover:bg-red-600 text-white font-semibold"
                                }
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : dialogState.decision === "approved" ? (
                                    "Confirm"
                                ) : (
                                    "Confirm Reject"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {detailReq && (
                <RequestDetailDialog
                    req={detailReq}
                    onClose={() => setDetailReq(null)}
                />
            )}
        </>
    );
}

function RequestDetailDialog({
    req,
    onClose,
}: {
    req: AdminOwnershipRequest;
    onClose: () => void;
}) {
    const [reply, setReply] = useState("");
    const [isSending, startSending] = useTransition();
    const [sentConversationId, setSentConversationId] = useState<string | null>(null);

    const isOrg = req.content_type === "organization";
    const name = req.requesting_user_name ?? req.requesting_org_name ?? "Unknown requester";
    const username = req.requesting_user_username;
    const country = req.requesting_user_country;
    const avatar = req.requesting_user_avatar;
    const canReply = !!req.requesting_user_id;

    const handleSend = () => {
        if (!req.requesting_user_id) return;
        const body = reply.trim();
        if (!body) return;
        startSending(async () => {
            const result = await sendClaimReplyToRequester(req.requesting_user_id!, body);
            if (result.success) {
                toast.success("Reply sent to the requester's inbox.");
                setReply("");
                setSentConversationId(result.conversationId ?? null);
            } else {
                toast.error(result.error ?? "Failed to send reply.");
            }
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#0B0F14] border-white/10 text-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isOrg ? (
                            <Building2 className="h-5 w-5 text-[var(--brand)]" />
                        ) : (
                            <Package className="h-5 w-5 text-blue-300" />
                        )}
                        Claim request details
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {isOrg
                            ? `Company claim for "${req.stub_org_name ?? "Unknown"}"`
                            : `Product claim for "${req.product_name}"`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    {/* Requester profile */}
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                        <Avatar className="h-12 w-12 border border-white/10">
                            <AvatarImage src={avatar || ""} alt={name} />
                            <AvatarFallback className="bg-[var(--brand)] text-black font-bold">
                                {name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-white truncate">{name}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                {country && (
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {country}
                                    </span>
                                )}
                                {username && <span className="text-gray-500">@{username}</span>}
                            </div>
                        </div>
                        {username && (
                            <Link
                                href={`/profiles/${username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand)] hover:text-[#B5964A] whitespace-nowrap"
                            >
                                View profile
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                        )}
                    </div>

                    {/* Full message */}
                    <div className="space-y-1.5">
                        <div className="text-xs uppercase tracking-wider text-gray-500">
                            Message from requester
                        </div>
                        <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-gray-200 whitespace-pre-wrap">
                            {req.message || (
                                <span className="text-gray-600 italic">No message provided.</span>
                            )}
                        </div>
                    </div>

                    {req.admin_note && (
                        <div className="space-y-1.5">
                            <div className="text-xs uppercase tracking-wider text-gray-500">
                                Admin note
                            </div>
                            <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-gray-300 whitespace-pre-wrap">
                                {req.admin_note}
                            </div>
                        </div>
                    )}

                    {/* Reply */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Reply via inbox
                        </div>
                        {canReply ? (
                            <>
                                <Textarea
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder="Write a message — it goes straight to the requester's messaging inbox."
                                    maxLength={2000}
                                    className="h-24 resize-none bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[var(--brand)] focus-visible:border-[var(--brand)]"
                                />
                                {sentConversationId && (
                                    <Link
                                        href="/messages"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand)] hover:text-[#B5964A]"
                                    >
                                        View conversation in inbox
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                )}
                            </>
                        ) : (
                            <p className="text-xs text-gray-500 italic">
                                This claim has no associated user account to reply to.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        Close
                    </Button>
                    {canReply && (
                        <Button
                            onClick={handleSend}
                            disabled={isSending || reply.trim().length === 0}
                            className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold gap-2"
                        >
                            {isSending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            Send reply
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "pending") {
        return (
            <Badge
                variant="outline"
                className="border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
            >
                Pending
            </Badge>
        );
    }
    if (status === "approved") {
        return (
            <Badge
                variant="outline"
                className="border-green-500/50 text-green-400 bg-green-500/10"
            >
                Approved
            </Badge>
        );
    }
    return (
        <Badge
            variant="outline"
            className="border-red-500/50 text-red-400 bg-red-500/10"
        >
            Rejected
        </Badge>
    );
}
