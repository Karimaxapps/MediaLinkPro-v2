"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ArrowLeft } from "lucide-react";
import { createJob } from "../server/actions";
import { JOB_TYPE_LABELS, type JobType } from "../types";

type Org = { id: string; name: string; slug: string };

export function NewJobClient({ organizations }: { organizations: Org[] }) {
  const t = useTranslations("jobs");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    organization_id: organizations[0]?.id ?? "",
    title: "",
    description: "",
    department: "",
    job_type: "full_time" as JobType,
    location: "",
    is_remote: false,
    salary_min: "",
    salary_max: "",
    currency: "USD",
    skills: "",
    expires_at: "",
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.organization_id) {
      toast.error(t("toastFillRequired"));
      return;
    }

    const skills = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const result = await createJob({
        organization_id: form.organization_id,
        title: form.title,
        description: form.description || undefined,
        department: form.department || undefined,
        job_type: form.job_type,
        location: form.location || undefined,
        is_remote: form.is_remote,
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
        currency: form.currency || "USD",
        skills,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : undefined,
        status: "open",
      });

      if (result.success) {
        toast.success(t("toastJobPosted"));
        router.push("/jobs/manage");
      } else {
        toast.error(result.error ?? t("toastPostFailed"));
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/jobs/manage"
        className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        {t("backToManage")}
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{t("postAJob")}</h1>
        <p className="text-sm text-gray-400">{t("postJobSubtitle")}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-6"
      >
        {organizations.length > 1 && (
          <div className="space-y-2">
            <Label className="text-gray-300">{t("companyRequired")}</Label>
            <select
              value={form.organization_id}
              onChange={(e) => update("organization_id", e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-[var(--brand)]/50 outline-none [&>option]:bg-[#1F1F1F] [&>option]:text-white"
            >
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-gray-300">{t("jobTitleRequired")}</Label>
          <Input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder={t("jobTitlePlaceholder")}
            className="bg-black/20 border-white/10 text-white"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">{t("jobTypeRequired")}</Label>
            <select
              value={form.job_type}
              onChange={(e) => update("job_type", e.target.value as JobType)}
              className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-[var(--brand)]/50 outline-none [&>option]:bg-[#1F1F1F] [&>option]:text-white"
            >
              {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map((key) => (
                <option key={key} value={key}>
                  {t(`jobTypes.${key}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t("department")}</Label>
            <Input
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              placeholder={t("departmentPlaceholder")}
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="is_remote"
            type="checkbox"
            checked={form.is_remote}
            onChange={(e) => update("is_remote", e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-black/20"
          />
          <Label htmlFor="is_remote" className="text-gray-300 cursor-pointer">
            {t("remoteRole")}
          </Label>
        </div>

        {!form.is_remote && (
          <div className="space-y-2">
            <Label className="text-gray-300">{t("location")}</Label>
            <Input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder={t("locationPlaceholder")}
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">{t("salaryMin")}</Label>
            <Input
              type="number"
              min="0"
              value={form.salary_min}
              onChange={(e) => update("salary_min", e.target.value)}
              placeholder="60000"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t("salaryMax")}</Label>
            <Input
              type="number"
              min="0"
              value={form.salary_max}
              onChange={(e) => update("salary_max", e.target.value)}
              placeholder="90000"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t("currency")}</Label>
            <Input
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
              placeholder={t("currencyPlaceholder")}
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">{t("skillsLabel")}</Label>
          <Input
            value={form.skills}
            onChange={(e) => update("skills", e.target.value)}
            placeholder={t("skillsPlaceholder")}
            className="bg-black/20 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">{t("expiresOptional")}</Label>
          <Input
            type="datetime-local"
            value={form.expires_at}
            onChange={(e) => update("expires_at", e.target.value)}
            className="bg-black/20 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">{t("description")}</Label>
          <RichTextEditor
            value={form.description}
            onChange={(value) => update("description", value)}
            placeholder={t("descriptionPlaceholder")}
          />
          <p className="text-xs text-gray-500">{t("descriptionHint")}</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium"
          >
            {isPending ? t("posting") : t("publishJob")}
          </Button>
          <Link href="/jobs/manage">
            <Button
              type="button"
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/10"
            >
              {t("cancel")}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
