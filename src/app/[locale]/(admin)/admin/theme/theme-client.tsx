"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resetThemeSettings,
  updateThemeSettings,
} from "@/features/admin/server/theme-settings";
import { DEFAULT_THEME, HEX_RE, type ThemeSettings } from "@/features/admin/theme-defaults";
import { RotateCcw, Save, Eye } from "lucide-react";

type FieldKey = keyof Omit<ThemeSettings, "updated_at">;

const FIELDS: { key: FieldKey; label: string; help: string }[] = [
  {
    key: "brand",
    label: "Primary (brand)",
    help: "Main accent color. Used for primary CTA buttons, active states, icons, links.",
  },
  {
    key: "brand_secondary",
    label: "Secondary",
    help: "Supporting accent. Used for secondary highlights and contrast badges.",
  },
  {
    key: "brand_success",
    label: "Success",
    help: "Confirmation states, success toasts, positive metrics.",
  },
  {
    key: "brand_warning",
    label: "Warning",
    help: "Caution states, pending badges, attention-needed copy.",
  },
  {
    key: "brand_destructive",
    label: "Destructive",
    help: "Errors, delete actions, destructive confirmations.",
  },
];

const PRESETS: { name: string; values: Pick<ThemeSettings, "brand" | "brand_secondary"> }[] = [
  { name: "Gold (current)", values: { brand: "#C6A85E", brand_secondary: "#135BEC" } },
  { name: "Emerald", values: { brand: "#10B981", brand_secondary: "#0EA5E9" } },
  { name: "Indigo", values: { brand: "#6366F1", brand_secondary: "#EC4899" } },
  { name: "Crimson", values: { brand: "#E11D48", brand_secondary: "#F59E0B" } },
  { name: "Cyan", values: { brand: "#06B6D4", brand_secondary: "#A855F7" } },
  { name: "Orange", values: { brand: "#F97316", brand_secondary: "#6366F1" } },
];

export function ThemeClient({ initial }: { initial: ThemeSettings }) {
  const [draft, setDraft] = useState<ThemeSettings>(initial);
  const [previewLive, setPreviewLive] = useState(false);
  const [pending, startTransition] = useTransition();

  const allValid = useMemo(
    () => FIELDS.every((f) => HEX_RE.test(draft[f.key] ?? "")),
    [draft]
  );
  const isDirty = useMemo(
    () => FIELDS.some((f) => draft[f.key] !== initial[f.key]),
    [draft, initial]
  );

  // When "Preview live" is on, mirror the draft into <html> so the admin sees
  // the new colors applied across the page (sidebar, header, buttons, etc.)
  // without committing the change.
  const previewStyle = previewLive
    ? ({
        ["--brand" as string]: draft.brand,
        ["--brand-secondary" as string]: draft.brand_secondary,
        ["--brand-success" as string]: draft.brand_success,
        ["--brand-warning" as string]: draft.brand_warning,
        ["--brand-destructive" as string]: draft.brand_destructive,
      } as React.CSSProperties)
    : undefined;

  const onSave = () => {
    if (!allValid) {
      toast.error("All colors must be valid 6-digit hex values (e.g. #C6A85E).");
      return;
    }
    startTransition(async () => {
      const res = await updateThemeSettings(draft);
      if (res.success) {
        toast.success(res.message ?? "Theme saved.");
      } else {
        toast.error(res.error ?? "Failed to save theme.");
      }
    });
  };

  const onReset = () => {
    startTransition(async () => {
      const res = await resetThemeSettings();
      if (res.success) {
        setDraft(DEFAULT_THEME);
        toast.success("Theme reset to defaults.");
      } else {
        toast.error(res.error ?? "Failed to reset theme.");
      }
    });
  };

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setDraft((prev) => ({ ...prev, ...p.values }));
  };

  return (
    <div className="space-y-6" style={previewStyle}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={previewLive}
            onChange={(e) => setPreviewLive(e.target.checked)}
            className="h-4 w-4 accent-[var(--brand)]"
          />
          <Eye className="h-4 w-4" />
          Preview live on this page (does not save)
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={pending}
            className="bg-transparent"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Reset to defaults
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={pending || !isDirty || !allValid}
            className="bg-[var(--brand)] text-black hover:bg-[var(--brand)]/90"
          >
            <Save className="h-4 w-4 mr-1.5" />
            {pending ? "Saving…" : "Save & apply globally"}
          </Button>
        </div>
      </div>

      {/* Presets */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Quick presets</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 hover:border-white/30 hover:bg-white/10 transition-colors"
            >
              <span className="flex items-center gap-1">
                <span
                  className="h-4 w-4 rounded-full ring-1 ring-white/20"
                  style={{ backgroundColor: p.values.brand }}
                />
                <span
                  className="h-4 w-4 rounded-full ring-1 ring-white/20"
                  style={{ backgroundColor: p.values.brand_secondary }}
                />
              </span>
              {p.name}
            </button>
          ))}
        </div>
      </section>

      {/* Color pickers */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map((f) => {
          const value = draft[f.key];
          const valid = HEX_RE.test(value);
          return (
            <div
              key={f.key}
              className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Label htmlFor={`color-${f.key}`} className="text-sm font-semibold text-white">
                    {f.label}
                  </Label>
                  <p className="text-xs text-gray-400 mt-1">{f.help}</p>
                </div>
                <div
                  className="h-14 w-14 shrink-0 rounded-lg ring-1 ring-white/20 shadow-inner"
                  style={{ backgroundColor: valid ? value : "transparent" }}
                  aria-hidden
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id={`color-${f.key}`}
                  type="color"
                  value={valid ? value : "#000000"}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, [f.key]: e.target.value.toUpperCase() }))
                  }
                  className="h-10 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                  aria-label={`${f.label} color picker`}
                />
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder="#RRGGBB"
                  className={`font-mono text-sm ${!valid ? "border-red-500/60" : ""}`}
                  maxLength={7}
                />
              </div>
              {!valid && (
                <p className="text-xs text-red-400">Must be a 6-digit hex like var(--brand).</p>
              )}
            </div>
          );
        })}
      </section>

      {/* Live preview swatches */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Preview</h2>
        <p className="text-xs text-gray-400">
          These samples use the same CSS variables as the live app. Toggle "Preview live" above to
          see the rest of this page update too.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-[var(--brand)] text-black hover:bg-[var(--brand)]/90">
            Primary CTA
          </Button>
          <Button
            variant="outline"
            className="bg-transparent border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)]/10"
          >
            Outline
          </Button>
          <a href="#" className="text-[var(--brand)] underline self-center text-sm">
            Sample link
          </a>
          <span className="rounded-md bg-[var(--brand)]/15 px-2.5 py-1 text-xs text-[var(--brand)] self-center">
            Badge
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="rounded-md px-2.5 py-1 text-xs text-white" style={{ backgroundColor: draft.brand_secondary }}>
            Secondary
          </span>
          <span className="rounded-md px-2.5 py-1 text-xs text-white" style={{ backgroundColor: draft.brand_success }}>
            Success
          </span>
          <span className="rounded-md px-2.5 py-1 text-xs text-black" style={{ backgroundColor: draft.brand_warning }}>
            Warning
          </span>
          <span className="rounded-md px-2.5 py-1 text-xs text-white" style={{ backgroundColor: draft.brand_destructive }}>
            Destructive
          </span>
        </div>
      </section>
    </div>
  );
}
