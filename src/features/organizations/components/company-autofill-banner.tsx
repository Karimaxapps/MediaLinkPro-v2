"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CompanyWizardValues } from "../schema";

interface CompanyAutofillBannerProps {
  onImport: (data: Partial<CompanyWizardValues>, foundFields: string[]) => void;
  onDismiss: () => void;
}

type State = "idle" | "loading" | "success" | "error";

export function CompanyAutofillBanner({ onImport, onDismiss }: CompanyAutofillBannerProps) {
  const t = useTranslations("companies");
  const [url, setUrl] = React.useState("");
  const [state, setState] = React.useState<State>("idle");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [foundFields, setFoundFields] = React.useState<string[]>([]);
  const [importedDomain, setImportedDomain] = React.useState("");

  const handleImport = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    // Auto-prepend https:// if missing
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/company-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setErrorMsg(json.error ?? t("failedFetch"));
        setState("error");
        return;
      }

      const { data, foundFields: fields } = json as {
        data: Partial<CompanyWizardValues>;
        foundFields: string[];
      };

      setFoundFields(fields);
      try {
        setImportedDomain(new URL(normalized).hostname.replace(/^www\./, ""));
      } catch {
        setImportedDomain(normalized);
      }

      onImport(data, fields);
      setState("success");
    } catch {
      setErrorMsg(t("couldNotReach"));
      setState("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleImport();
  };

  if (state === "success") {
    const labels = foundFields
      .map((f) => t(`fieldLabels.${f}`))
      .filter(Boolean)
      .slice(0, 6);
    const fieldsStr =
      labels.join(", ") +
      (foundFields.length > 6 ? ` ${t("andMore", { count: foundFields.length - 6 })}` : "");

    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
        <p className="text-sm text-green-300">
          <span className="font-medium">{t("importedFrom", { domain: importedDomain })}</span>
          {labels.length > 0 && t("prefilledReview", { fields: fieldsStr })}
        </p>
        <button
          onClick={onDismiss}
          className="ml-auto shrink-0 text-gray-500 hover:text-gray-300"
          aria-label={t("dismiss")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-6 rounded-lg border px-4 py-4 transition-all",
        state === "error" ? "border-red-500/30 bg-red-500/5" : "border-white/10 bg-white/5"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--brand)]" />
          <span className="text-sm font-medium text-gray-200">{t("importFromWebsite")}</span>
          <span className="rounded-full bg-[var(--brand)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--brand)]">
            {t("optional")}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-600 hover:text-gray-400 transition-colors"
          aria-label={t("skipAutofill")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mb-3 text-xs text-gray-500">{t("autofillDesc")}</p>

      <div className="flex gap-2">
        <Input
          type="url"
          placeholder={t("websitePlaceholder")}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={state === "loading"}
          className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-gray-600 text-sm h-9"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleImport}
          disabled={state === "loading" || !url.trim()}
          className="h-9 bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold shrink-0"
        >
          {state === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("autofill")
          )}
        </Button>
      </div>

      {state === "error" && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
