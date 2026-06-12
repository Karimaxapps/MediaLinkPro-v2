"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { FileText, Link2 } from "lucide-react";
import { getResumeViewUrl } from "../server/actions";
import type { ResumeType } from "../types";

type Props = {
  applicationId: string;
  resumeType: ResumeType;
  label: string;
};

/**
 * Opens an application's resume. PDF resumes are stored in a private bucket,
 * so the URL has to be signed on demand instead of linked directly.
 */
export function ResumeLink({ applicationId, resumeType, label }: Props) {
  const [isPending, startTransition] = useTransition();

  const onOpen = () => {
    startTransition(async () => {
      const result = await getResumeViewUrl(applicationId);
      if (result.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error(result.error ?? "Could not open this resume.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={isPending}
      className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-60"
    >
      {resumeType === "pdf" ? (
        <FileText className="h-4 w-4 text-[var(--brand)]" />
      ) : (
        <Link2 className="h-4 w-4 text-[var(--brand)]" />
      )}
      {isPending ? "…" : label}
    </button>
  );
}
