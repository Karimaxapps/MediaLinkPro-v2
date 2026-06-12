"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2, User, X } from "lucide-react";
import { expressInterest } from "../server/actions";

type Org = { id: string; name: string; slug: string; logo_url: string | null };

type Props = {
  requestId: string;
  requestTitle: string;
  organizations: Org[];
  onClose: () => void;
  onSuccess: () => void;
};

export function ExpressInterestDialog({
  requestId,
  requestTitle,
  organizations,
  onClose,
  onSuccess,
}: Props) {
  const t = useTranslations("requestsMarket");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // "" = respond as myself, otherwise the acting org id.
  const [actingOrgId, setActingOrgId] = useState<string>("");
  const [pitch, setPitch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pitch.trim().length < 10) {
      toast.error(t("toastPitchTooShort"));
      return;
    }

    startTransition(async () => {
      const result = await expressInterest({
        request_id: requestId,
        pitch: pitch.trim(),
        organization_id: actingOrgId || undefined,
      });

      if (result.success) {
        toast.success(t("toastInterestSent"));
        onSuccess();
        router.refresh();
      } else {
        toast.error(result.error ?? t("toastInterestFailed"));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0B0F14] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{t("expressInterest")}</h2>
            <p className="text-sm text-gray-400 line-clamp-1">{requestTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {organizations.length > 0 && (
            <div className="space-y-2">
              <Label className="text-gray-300">{t("respondAs")}</Label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActingOrgId("")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border transition-colors ${
                    actingOrgId === ""
                      ? "bg-[var(--brand)]/20 border-[var(--brand)]/40 text-[var(--brand)]"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  {t("myself")}
                </button>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => setActingOrgId(org.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border transition-colors ${
                      actingOrgId === org.id
                        ? "bg-[var(--brand)]/20 border-[var(--brand)]/40 text-[var(--brand)]"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    {org.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-gray-300">{t("pitchLabel")}</Label>
            <Textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder={t("pitchPlaceholder")}
              rows={6}
              maxLength={2000}
              className="bg-black/20 border-white/10 text-white"
            />
            <p className="text-xs text-gray-500 text-right">{pitch.length}/2000</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/10"
              onClick={onClose}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending || pitch.trim().length < 10}
              className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium"
            >
              {isPending ? t("sending") : t("sendInterest")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
