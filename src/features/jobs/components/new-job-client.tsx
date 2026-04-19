"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { createJob } from "../server/actions";
import { JOB_TYPE_LABELS, type JobType } from "../types";

type Org = { id: string; name: string; slug: string };

export function NewJobClient({ organizations }: { organizations: Org[] }) {
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
      toast.error("Please fill in all required fields");
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
        toast.success("Job posted!");
        router.push("/jobs/manage");
      } else {
        toast.error(result.error ?? "Failed to post job");
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
        Back to manage jobs
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Post a job</h1>
        <p className="text-sm text-gray-400">
          Only organizations with an active company profile can publish openings.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-6"
      >
        {organizations.length > 1 && (
          <div className="space-y-2">
            <Label className="text-gray-300">Company *</Label>
            <select
              value={form.organization_id}
              onChange={(e) => update("organization_id", e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-[#C6A85E]/50 outline-none"
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
          <Label className="text-gray-300">Job title *</Label>
          <Input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Senior Broadcast Engineer"
            className="bg-black/20 border-white/10 text-white"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Job type *</Label>
            <select
              value={form.job_type}
              onChange={(e) => update("job_type", e.target.value as JobType)}
              className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-[#C6A85E]/50 outline-none"
            >
              {Object.entries(JOB_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Department</Label>
            <Input
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              placeholder="Engineering, Production, Sales..."
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
            Remote role
          </Label>
        </div>

        {!form.is_remote && (
          <div className="space-y-2">
            <Label className="text-gray-300">Location</Label>
            <Input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Dubai, UAE"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Salary min</Label>
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
            <Label className="text-gray-300">Salary max</Label>
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
            <Label className="text-gray-300">Currency</Label>
            <Input
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
              placeholder="USD"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Required skills (comma separated)</Label>
          <Input
            value={form.skills}
            onChange={(e) => update("skills", e.target.value)}
            placeholder="OB production, Vision mixing, EVS"
            className="bg-black/20 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Expires at (optional)</Label>
          <Input
            type="datetime-local"
            value={form.expires_at}
            onChange={(e) => update("expires_at", e.target.value)}
            className="bg-black/20 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={8}
            placeholder="Responsibilities, requirements, team, perks..."
            className="bg-black/20 border-white/10 text-white"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium"
          >
            {isPending ? "Posting..." : "Publish job"}
          </Button>
          <Link href="/jobs/manage">
            <Button
              type="button"
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
