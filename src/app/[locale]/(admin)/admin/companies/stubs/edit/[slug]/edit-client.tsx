"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORG_TYPES, BROADCASTER_TYPES, type CompanyWizardValues } from "@/features/organizations/schema";
import { MainActivitySelect } from "@/features/organizations/components/main-activity-select";
import { AdminLogoUpload } from "@/features/organizations/components/admin-logo-upload";
import { adminUpdateStubAction } from "@/features/organizations/server/stub-actions";
import { COUNTRIES } from "@/features/organizations/data/countries";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

type StubOrg = {
  id: string;
  name: string;
  slug: string;
  type: string | null;
  broadcaster_type: string | null;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  main_activity: string | null;
  website: string | null;
  contact_email: string | null;
  phone: string | null;
  country: string | null;
  address: string | null;
  linkedin_url: string | null;
  x_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
};

export function StubEditClient({ org, userId: _userId }: { org: StubOrg; userId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: org.name,
    slug: org.slug,
    type: (org.type ?? "Solution Provider") as (typeof ORG_TYPES)[number],
    broadcaster_type: (org.broadcaster_type ?? "") as (typeof BROADCASTER_TYPES)[number] | "",
    tagline: org.tagline ?? "",
    description: org.description ?? "",
    logo_url: org.logo_url ?? "",
    main_activity: org.main_activity ?? "",
    website: org.website ?? "",
    contact_email: org.contact_email ?? "",
    phone: org.phone ?? "",
    country: org.country ?? "",
    address: org.address ?? "",
    linkedin_url: org.linkedin_url ?? "",
    x_url: org.x_url ?? "",
    facebook_url: org.facebook_url ?? "",
    instagram_url: org.instagram_url ?? "",
    tiktok_url: org.tiktok_url ?? "",
    youtube_url: org.youtube_url ?? "",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload: CompanyWizardValues = {
        ...form,
        broadcaster_type:
          form.type === "Broadcaster"
            ? (form.broadcaster_type as (typeof BROADCASTER_TYPES)[number]) || undefined
            : undefined,
      };
      const result = await adminUpdateStubAction(org.id, payload);
      if (result.success) {
        toast.success("Stub updated.");
        router.push("/admin/companies");
      } else {
        toast.error(result.error ?? "Failed to update stub.");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/companies"
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Companies
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mt-2">
            <Building2 className="h-6 w-6 text-[var(--brand)]" />
            Edit Stub — {org.name}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Editing an unclaimed stub. Changes take effect immediately on the public page.
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-6"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name *">
            <Input
              required
              value={form.name}
              onChange={(e) => {
                const v = e.target.value;
                set("name", v);
                if (form.slug === slugify(org.name)) set("slug", slugify(v));
              }}
              className="bg-black/20 border-white/10 text-white"
            />
          </Field>
          <Field label="Slug *">
            <Input
              required
              value={form.slug}
              onChange={(e) =>
                set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              className="bg-black/20 border-white/10 text-white font-mono text-sm"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Type *">
            <Select
              value={form.type}
              onValueChange={(v) => {
                set("type", v as (typeof ORG_TYPES)[number]);
                if (v !== "Broadcaster") set("broadcaster_type", "");
              }}
            >
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORG_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {form.type === "Broadcaster" && (
            <Field label="Broadcaster Type">
              <Select
                value={form.broadcaster_type}
                onValueChange={(v) =>
                  set("broadcaster_type", v as (typeof BROADCASTER_TYPES)[number])
                }
              >
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {BROADCASTER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </div>

        <Field label="Main activity *">
          <MainActivitySelect
            orgType={form.type}
            value={form.main_activity}
            onChange={(v) => set("main_activity", v)}
            triggerClassName="bg-black/20 border-white/10 text-white"
            inputClassName="bg-black/20 border-white/10 text-white"
          />
        </Field>

        <Field label="Tagline">
          <Input
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            className="bg-black/20 border-white/10 text-white"
          />
        </Field>

        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="bg-black/20 border-white/10 text-white h-28"
          />
        </Field>

        <div className="space-y-1.5">
          <Label className="text-sm text-gray-300">Logo</Label>
          <div className="flex justify-center py-2">
            <AdminLogoUpload
              currentLogoUrl={form.logo_url}
              onUploadSuccess={(url) => set("logo_url", url)}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Website *">
            <Input
              required
              type="url"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              className="bg-black/20 border-white/10 text-white"
            />
          </Field>
          <Field label="Country *">
            <Select value={form.country} onValueChange={(v) => set("country", v)}>
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Select country…" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.name}>
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                        width={20}
                        height={14}
                        alt=""
                        className="rounded-sm shrink-0"
                      />
                      <span>{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Contact email">
            <Input
              type="email"
              value={form.contact_email}
              onChange={(e) => set("contact_email", e.target.value)}
              className="bg-black/20 border-white/10 text-white"
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="bg-black/20 border-white/10 text-white"
            />
          </Field>
        </div>

        <Field label="Address">
          <Input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className="bg-black/20 border-white/10 text-white"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="LinkedIn URL">
            <Input value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} className="bg-black/20 border-white/10 text-white" />
          </Field>
          <Field label="X URL">
            <Input value={form.x_url} onChange={(e) => set("x_url", e.target.value)} className="bg-black/20 border-white/10 text-white" />
          </Field>
          <Field label="Facebook URL">
            <Input value={form.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} className="bg-black/20 border-white/10 text-white" />
          </Field>
          <Field label="Instagram URL">
            <Input value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} className="bg-black/20 border-white/10 text-white" />
          </Field>
          <Field label="TikTok URL">
            <Input value={form.tiktok_url} onChange={(e) => set("tiktok_url", e.target.value)} className="bg-black/20 border-white/10 text-white" />
          </Field>
          <Field label="YouTube URL">
            <Input value={form.youtube_url} onChange={(e) => set("youtube_url", e.target.value)} className="bg-black/20 border-white/10 text-white" />
          </Field>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/companies")}
            className="bg-transparent border-white/20 text-gray-300 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[var(--brand)] text-black hover:bg-[#B5964A] font-semibold"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-gray-300">{label}</Label>
      {children}
    </div>
  );
}

