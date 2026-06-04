"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  MapPin,
  BadgeCheck,
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
import { resolveVerificationRequest } from "@/features/admin/server/actions";
import type { AdminVerificationRequest } from "@/features/verification/types";

interface Props {
  requests: AdminVerificationRequest[];
  readOnly?: boolean;
}

type DialogState = {
  requestId: string;
  decision: "approved" | "rejected";
  userName: string;
};

export function VerificationsClient({ requests, readOnly = false }: Props) {
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const openDialog = (state: DialogState) => {
    setAdminNote("");
    setDialogState(state);
  };

  const handleResolve = () => {
    if (!dialogState) return;
    startTransition(async () => {
      const result = await resolveVerificationRequest(
        dialogState.requestId,
        dialogState.decision,
        adminNote || undefined
      );
      if (result.success) {
        toast.success(dialogState.decision === "approved" ? "Verified." : "Request rejected.");
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
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
              <th className="text-left p-4 font-medium">Member</th>
              <th className="text-left p-4 font-medium">Proof</th>
              <th className="text-left p-4 font-medium">Note</th>
              <th className="text-left p-4 font-medium">Date</th>
              <th className="text-left p-4 font-medium">Status</th>
              {!readOnly && <th className="text-right p-4 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-white/10">
                      <AvatarImage src={req.user_avatar || ""} alt={req.user_name} />
                      <AvatarFallback className="bg-[var(--brand)] text-black font-bold text-xs">
                        {req.user_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">{req.user_name}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {req.user_username && (
                          <Link
                            href={`/profiles/${req.user_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--brand)]"
                          >
                            @{req.user_username}
                          </Link>
                        )}
                        {req.user_country && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {req.user_country}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 max-w-[240px]">
                  <a
                    href={req.proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-300 hover:text-blue-200 truncate max-w-full"
                    title={req.proof_url}
                  >
                    <span className="truncate">{req.proof_url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </td>
                <td className="p-4 max-w-[200px]">
                  <p className="text-sm text-gray-400 truncate" title={req.note ?? ""}>
                    {req.note || <span className="text-gray-600 italic">No note</span>}
                  </p>
                  {req.admin_note && (
                    <p className="text-xs text-gray-500 mt-1 truncate" title={req.admin_note}>
                      Admin: {req.admin_note}
                    </p>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                  {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                </td>
                <td className="p-4">
                  <StatusBadge status={req.status} />
                </td>
                {!readOnly && req.status === "pending" && (
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() =>
                          openDialog({
                            requestId: req.id,
                            decision: "approved",
                            userName: req.user_name,
                          })
                        }
                        className="bg-green-600 hover:bg-green-500 text-white gap-1 h-8 px-3"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          openDialog({
                            requestId: req.id,
                            decision: "rejected",
                            userName: req.user_name,
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
            ))}
          </tbody>
        </table>
      </div>

      {dialogState && (
        <Dialog open onOpenChange={(open) => !open && setDialogState(null)}>
          <DialogContent className="bg-[#0B0F14] border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle
                className={
                  dialogState.decision === "approved" ? "text-green-400" : "text-red-400"
                }
              >
                <span className="inline-flex items-center gap-2">
                  {dialogState.decision === "approved" ? (
                    <BadgeCheck className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  {dialogState.decision === "approved" ? "Verify member" : "Reject request"}
                </span>
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {dialogState.decision === "approved"
                  ? `Grant the Verified Pro badge to ${dialogState.userName}.`
                  : `Reject ${dialogState.userName}'s verification request. They can resubmit.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label className="text-sm text-gray-300">
                Admin note <span className="text-gray-500">(optional)</span>
              </label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. LinkedIn confirms identity. / Couldn't confirm — please share a company page."
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
        Verified
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10">
      Rejected
    </Badge>
  );
}
