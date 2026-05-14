"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteDocArticle } from "@/features/docs/server/actions";

export function DeleteDocButton({ id, title }: { id: string; title: string }) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirm) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() =>
            startTransition(async () => {
              const result = await deleteDocArticle(id);
              if (!result.success) {
                toast.error(result.error ?? "Failed to delete");
              } else {
                toast.success("Article deleted");
              }
              setConfirm(false);
            })
          }
          disabled={isPending}
          className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded border border-red-500/30 hover:bg-red-500/10 transition-colors"
        >
          {isPending ? "…" : "Delete"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded border border-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      title={`Delete "${title}"`}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
