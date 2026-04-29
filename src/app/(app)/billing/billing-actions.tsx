"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createCheckoutSession, createBillingPortalSession } from "@/features/billing/server/actions";

type Props = {
    planId?: string;
    priceId?: string | null;
    isCurrent?: boolean;
    highlighted?: boolean;
    label?: string;
    showManage?: boolean;
};

export function BillingActions({
    priceId,
    isCurrent,
    highlighted,
    label,
    showManage,
}: Props) {
    const [isPending, startTransition] = useTransition();

    const handleUpgrade = () => {
        if (!priceId) {
            toast.info("Contact sales for this plan");
            return;
        }
        startTransition(async () => {
            try {
                await createCheckoutSession(priceId);
            } catch (err) {
                if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
                    toast.error(err.message);
                }
            }
        });
    };

    const handleManage = () => {
        startTransition(async () => {
            try {
                await createBillingPortalSession();
            } catch (err) {
                if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
                    toast.error(err.message);
                }
            }
        });
    };

    if (showManage) {
        return (
            <Button
                variant="outline"
                className="border-white/10 hover:bg-white/10"
                disabled={isPending}
                onClick={handleManage}
            >
                Manage subscription
            </Button>
        );
    }

    return (
        <Button
            className={`w-full ${
                highlighted
                    ? "bg-[#C6A85E] hover:bg-[#b5975a] text-black"
                    : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            disabled={isPending || isCurrent}
            onClick={handleUpgrade}
        >
            {label ?? "Upgrade"}
        </Button>
    );
}
