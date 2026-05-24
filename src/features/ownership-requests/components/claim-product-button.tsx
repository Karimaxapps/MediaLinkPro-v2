"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, BadgeCheck, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { submitOwnershipRequest } from "@/features/ownership-requests/server/actions";
import type { OwnershipRequest } from "@/features/ownership-requests/types";

interface ClaimProductButtonProps {
    productId: string;
    userOrgId: string | null;
    existingRequest: OwnershipRequest | null;
    isPlatformProduct: boolean;
}

export function ClaimProductButton({
    productId,
    userOrgId,
    existingRequest,
    isPlatformProduct,
}: ClaimProductButtonProps) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();

    if (!isPlatformProduct) return null;
    if (!userOrgId) return null;

    if (existingRequest?.status === "approved") return null;

    if (existingRequest?.status === "pending") {
        return (
            <Badge
                variant="outline"
                className="border-yellow-500/50 text-yellow-400 bg-yellow-500/10 gap-1.5 px-3 py-1.5"
            >
                <Loader2 className="h-3 w-3 animate-spin" />
                Claim Pending Review
            </Badge>
        );
    }

    const handleSubmit = () => {
        startTransition(async () => {
            const result = await submitOwnershipRequest(productId, userOrgId, message || undefined);
            if (result.success) {
                toast.success(result.message ?? "Claim submitted!");
                setOpen(false);
                setMessage("");
            } else {
                toast.error(result.error ?? "Failed to submit claim.");
            }
        });
    };

    const isResubmit = existingRequest?.status === "rejected";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="bg-transparent border-[var(--brand)]/50 text-[var(--brand)] hover:bg-[var(--brand)]/10 hover:border-[var(--brand)] gap-2"
                >
                    <Flag className="h-4 w-4" />
                    {isResubmit ? "Re-submit Claim" : "Claim this product"}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0B0F14] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-[var(--brand)]" />
                        Claim Product Ownership
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Submit a request to take ownership of this product. The MediaLinkPro team
                        will review your request and transfer control to your organization.
                    </DialogDescription>
                </DialogHeader>

                {isResubmit && existingRequest?.admin_note && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                        <span className="font-medium">Previous rejection reason: </span>
                        {existingRequest.admin_note}
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="text-gray-300">
                        Message to admin <span className="text-gray-500">(optional)</span>
                    </Label>
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Briefly explain why your organization should own this product..."
                        maxLength={500}
                        className="h-24 resize-none bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[var(--brand)] focus-visible:border-[var(--brand)]"
                    />
                    <div className="flex justify-end">
                        <span className="text-xs text-gray-500">{message.length}/500</span>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="text-gray-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Submit Claim"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
