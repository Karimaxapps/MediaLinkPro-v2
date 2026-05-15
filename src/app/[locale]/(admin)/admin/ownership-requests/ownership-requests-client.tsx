"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, XCircle, Loader2, ExternalLink, Building2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { resolveOwnershipRequest } from "@/features/admin/server/actions";
import type { AdminOwnershipRequest } from "@/features/ownership-requests/types";

interface Props {
    requests: AdminOwnershipRequest[];
    readOnly?: boolean;
}

export function OwnershipRequestsClient({ requests, readOnly = false }: Props) {
    const [dialogState, setDialogState] = useState<{
        open: boolean;
        requestId: string;
        decision: "approved" | "rejected";
        productName: string;
        orgName: string;
    } | null>(null);
    const [adminNote, setAdminNote] = useState("");
    const [isPending, startTransition] = useTransition();

    const openDialog = (
        requestId: string,
        decision: "approved" | "rejected",
        productName: string,
        orgName: string
    ) => {
        setAdminNote("");
        setDialogState({ open: true, requestId, decision, productName, orgName });
    };

    const handleResolve = () => {
        if (!dialogState) return;
        startTransition(async () => {
            const result = await resolveOwnershipRequest(
                dialogState.requestId,
                dialogState.decision,
                adminNote || undefined
            );
            if (result.success) {
                toast.success(
                    dialogState.decision === "approved"
                        ? "Ownership transferred successfully."
                        : "Claim rejected."
                );
                setDialogState(null);
            } else {
                toast.error(result.error ?? "Action failed.");
            }
        });
    };

    if (requests.length === 0) {
        return (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-500 text-sm">
                No requests here.
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                            <th className="text-left p-4 font-medium">Product</th>
                            <th className="text-left p-4 font-medium">Requesting Company</th>
                            <th className="text-left p-4 font-medium">Message</th>
                            <th className="text-left p-4 font-medium">Date</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            {!readOnly && <th className="text-right p-4 font-medium">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <a
                                        href={`/products/${req.product_slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-white hover:text-[#C6A85E] transition-colors font-medium text-sm"
                                    >
                                        <Package className="h-4 w-4 shrink-0 text-gray-500" />
                                        {req.product_name}
                                        <ExternalLink className="h-3 w-3 shrink-0 text-gray-500" />
                                    </a>
                                </td>
                                <td className="p-4">
                                    <a
                                        href={`/companies/${req.requesting_org_slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
                                    >
                                        <Building2 className="h-4 w-4 shrink-0 text-gray-500" />
                                        {req.requesting_org_name}
                                    </a>
                                </td>
                                <td className="p-4 max-w-[200px]">
                                    <p className="text-sm text-gray-400 truncate" title={req.message ?? ""}>
                                        {req.message || <span className="text-gray-600 italic">No message</span>}
                                    </p>
                                    {req.admin_note && (
                                        <p className="text-xs text-gray-500 mt-1 truncate" title={req.admin_note}>
                                            Note: {req.admin_note}
                                        </p>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                    {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={req.status} />
                                </td>
                                {!readOnly && (
                                    <td className="p-4">
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                size="sm"
                                                onClick={() => openDialog(req.id, "approved", req.product_name, req.requesting_org_name)}
                                                className="bg-green-600 hover:bg-green-500 text-white gap-1 h-8 px-3"
                                            >
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openDialog(req.id, "rejected", req.product_name, req.requesting_org_name)}
                                                className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400 gap-1 h-8 px-3"
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                Reject
                                            </Button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {dialogState && (
                <Dialog open={dialogState.open} onOpenChange={(open) => !open && setDialogState(null)}>
                    <DialogContent className="bg-[#0B0F14] border-white/10 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className={dialogState.decision === "approved" ? "text-green-400" : "text-red-400"}>
                                {dialogState.decision === "approved" ? "Approve Ownership Transfer" : "Reject Claim"}
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                                {dialogState.decision === "approved"
                                    ? `Transfer ownership of "${dialogState.productName}" to ${dialogState.orgName}. All other pending claims will be auto-rejected.`
                                    : `Reject the claim from ${dialogState.orgName} for "${dialogState.productName}".`}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">
                                Admin note <span className="text-gray-500">(optional, sent to claimant)</span>
                            </label>
                            <Textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="e.g. Welcome aboard! / Please verify your company ownership first."
                                className="h-24 resize-none bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
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
                                    "Confirm Transfer"
                                ) : (
                                    "Confirm Reject"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "pending") {
        return (
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 bg-yellow-500/10">
                Pending
            </Badge>
        );
    }
    if (status === "approved") {
        return (
            <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10">
                Approved
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10">
            Rejected
        </Badge>
    );
}
