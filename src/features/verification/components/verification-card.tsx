"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BadgeCheck, Clock, XCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitVerificationRequest } from "@/features/verification/server/actions";
import type { MyVerification } from "@/features/verification/types";

interface Props {
  verification: MyVerification;
  isPro: boolean;
}

export function VerificationCard({ verification, isPro }: Props) {
  const [proofUrl, setProofUrl] = useState("");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const status = verification.status;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitVerificationRequest({ proof_url: proofUrl, note: note || undefined });
      if (result.success) {
        toast.success(result.message ?? "Submitted.");
        setSubmitted(true);
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  };

  // Already verified ---------------------------------------------------------
  if (status === "verified") {
    return (
      <Shell>
        <div className="flex items-start gap-3">
          <BadgeCheck className="h-6 w-6 shrink-0 text-[var(--brand-secondary)]" />
          <div>
            <h4 className="font-semibold text-white">You&apos;re verified</h4>
            <p className="text-sm text-gray-400 mt-1">
              Your Verified Pro badge is live on your profile
              {verification.verified_at
                ? ` since ${new Date(verification.verified_at).toLocaleDateString()}.`
                : "."}
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  // Pending review (either freshly submitted or already pending) -------------
  if (status === "pending" || submitted) {
    return (
      <Shell>
        <div className="flex items-start gap-3">
          <Clock className="h-6 w-6 shrink-0 text-yellow-400" />
          <div>
            <h4 className="font-semibold text-white">Verification under review</h4>
            <p className="text-sm text-gray-400 mt-1">
              We&apos;re reviewing your request. You&apos;ll get the badge as soon as it&apos;s
              approved.
            </p>
            {verification.latestRequest?.proof_url && (
              <p className="text-xs text-gray-500 mt-2 break-all">
                Submitted proof: {verification.latestRequest.proof_url}
              </p>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  // Not a Pro — upsell --------------------------------------------------------
  if (!isPro) {
    return (
      <Shell>
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 shrink-0 text-[var(--brand)]" />
          <div>
            <h4 className="font-semibold text-white">Get the Verified Pro badge</h4>
            <p className="text-sm text-gray-400 mt-1">
              Identity verification is a Verified Pro perk. Upgrade, then submit a professional
              link and we&apos;ll review it.
            </p>
            <Link href="/billing" className="inline-block mt-4">
              <Button className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold rounded-full">
                Upgrade to Verified Pro
              </Button>
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  // Pro, not yet verified (status none or rejected) — show the form ----------
  return (
    <Shell>
      {status === "rejected" && verification.latestRequest && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <div className="text-sm text-red-300">
            Your previous request was rejected.
            {verification.latestRequest.admin_note && (
              <span className="block text-red-200/80 mt-0.5">
                Reviewer note: {verification.latestRequest.admin_note}
              </span>
            )}
            <span className="block text-red-200/60 mt-0.5">You can submit a new request below.</span>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <BadgeCheck className="h-6 w-6 shrink-0 text-[var(--brand-secondary)]" />
        <div className="flex-1">
          <h4 className="font-semibold text-white">Verify your identity</h4>
          <p className="text-sm text-gray-400 mt-1">
            Share a professional or social link that confirms who you are — LinkedIn, your company
            page, or a portfolio. We&apos;ll review it and add your badge.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="proof_url" className="text-xs font-medium text-gray-300">
                Proof URL
              </label>
              <Input
                id="proof_url"
                type="url"
                required
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/your-name"
                className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[var(--brand)] focus-visible:border-[var(--brand)]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="note" className="text-xs font-medium text-gray-300">
                Note <span className="text-gray-500">(optional)</span>
              </label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                placeholder="Anything that helps us verify you faster."
                className="h-20 resize-none bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[var(--brand)] focus-visible:border-[var(--brand)]"
              />
            </div>
            <Button
              type="submit"
              disabled={isPending || proofUrl.trim().length === 0}
              className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold rounded-full"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for review"}
            </Button>
          </form>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-white/10 bg-white/5 p-5">{children}</div>;
}
