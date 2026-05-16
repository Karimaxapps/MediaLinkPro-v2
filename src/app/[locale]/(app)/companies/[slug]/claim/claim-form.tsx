"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitOrgClaimAction } from "@/features/organizations/server/claim-actions";

export function ClaimForm({ stubId, slug }: { stubId: string; slug: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitOrgClaimAction(stubId, message);
      if (res.success) {
        toast.success(res.message ?? "Claim submitted.");
        setSubmitted(true);
      } else {
        toast.error(res.error ?? "Failed to submit claim.");
      }
    });
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 space-y-3">
        <p className="text-base font-semibold text-green-300">
          Claim submitted!
        </p>
        <p className="text-sm text-gray-300">
          An admin will review your request and notify you by email once
          decided. You can close this page.
        </p>
        <Button
          onClick={() => router.push(`/companies/${slug}`)}
          className="bg-[#C6A85E] text-black hover:bg-[#B5964A] font-semibold"
        >
          Back to company page
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm text-gray-300 font-medium">
          Message to admin <span className="text-gray-500">(required)</span>
        </label>
        <Textarea
          required
          minLength={20}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. I'm the Head of Marketing at this company. My work email is jane@company.com. You can verify on our LinkedIn page."
          className="h-32 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
        />
        <p className="text-xs text-gray-500">
          Min 20 characters. Be specific — vague claims are typically rejected.
        </p>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending || message.trim().length < 20}
          className="bg-[#C6A85E] text-black hover:bg-[#B5964A] font-semibold"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit claim"}
        </Button>
      </div>
    </form>
  );
}
