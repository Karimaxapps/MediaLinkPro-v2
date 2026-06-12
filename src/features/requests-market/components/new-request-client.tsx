"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2, User } from "lucide-react";
import { createRequest } from "../server/actions";
import type { MarketRequestCategory } from "../types";

type Org = { id: string; name: string; slug: string; logo_url: string | null };

type Props = {
  organizations: Org[];
};

const CATEGORY_KEYS: MarketRequestCategory[] = ["solution", "technology", "crew", "other"];

export function NewRequestClient({ organizations }: Props) {
  const t = useTranslations("requestsMarket");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [actingOrgId, setActingOrgId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MarketRequestCategory>("solution");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [skills, setSkills] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      toast.error(t("toastTitleTooShort"));
      return;
    }
    const min = budgetMin ? Number(budgetMin) : undefined;
    const max = budgetMax ? Number(budgetMax) : undefined;
    if (min !== undefined && max !== undefined && min > max) {
      toast.error(t("toastBudgetInvalid"));
      return;
    }

    startTransition(async () => {
      const result = await createRequest({
        organization_id: actingOrgId || undefined,
        title: title.trim(),
        category,
        description: description.trim() || undefined,
        budget_min: min,
        budget_max: max,
        currency,
        location: location.trim() || undefined,
        is_remote: isRemote,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 20),
        deadline: deadline || undefined,
      });

      if (result.success && result.slug) {
        toast.success(t("toastCreated"));
        router.push(`/requests/${result.slug}`);
      } else {
        toast.error(result.error ?? t("toastCreateFailed"));
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{t("newTitle")}</h1>
        <p className="text-sm text-gray-400">{t("newSubtitle")}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-6"
      >
        {/* Identity picker */}
        <div className="space-y-2">
          <Label className="text-gray-300">{t("postAs")}</Label>
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

        <div className="space-y-2">
          <Label className="text-gray-300">{t("titleLabel")}</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            maxLength={160}
            required
            className="bg-black/20 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">{t("categoryLabel")}</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  category === key
                    ? "bg-[var(--brand)]/20 border-[var(--brand)]/40 text-[var(--brand)]"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                {t(`categories.${key}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">{t("descriptionLabel")}</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            rows={7}
            className="bg-black/20 border-white/10 text-white"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">{t("budgetMin")}</Label>
            <Input
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              type="number"
              min="0"
              placeholder="0"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t("budgetMax")}</Label>
            <Input
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              type="number"
              min="0"
              placeholder="10000"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t("currency")}</Label>
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              maxLength={8}
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">{t("locationLabel")}</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("locationPlaceholder")}
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t("neededBy")}</Label>
            <Input
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              type="date"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={isRemote}
            onChange={(e) => setIsRemote(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-black/20 accent-[var(--brand)]"
          />
          {t("remoteLabel")}
        </label>

        <div className="space-y-2">
          <Label className="text-gray-300">{t("skillsLabel")}</Label>
          <Input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder={t("skillsPlaceholder")}
            className="bg-black/20 border-white/10 text-white"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Link href="/requests">
            <Button
              type="button"
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/10"
            >
              {t("cancel")}
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isPending || title.trim().length < 3}
            className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium"
          >
            {isPending ? t("publishing") : t("publish")}
          </Button>
        </div>
      </form>
    </div>
  );
}
