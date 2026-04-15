"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Briefcase,
    GraduationCap,
    Image as ImageIcon,
    Plus,
    Trash2,
    ExternalLink,
    CheckCircle2,
    Circle,
} from "lucide-react";
import type {
    ProfileExperience,
    ProfileEducation,
    ProfilePortfolioItem,
} from "../server/profile-details-actions";
import type { CompletionField } from "../completion";
import {
    addExperience,
    deleteExperience,
    addEducation,
    deleteEducation,
    addPortfolioItem,
    deletePortfolioItem,
} from "../server/profile-details-actions";

// ─── COMPLETION SCORE ─────────────────────────────

export function ProfileCompletionCard({
    score,
    fields,
}: {
    score: number;
    fields: CompletionField[];
}) {
    if (score === 100) return null;
    return (
        <section className="rounded-xl border border-[#C6A85E]/30 bg-[#C6A85E]/5 p-5">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Profile Strength</h3>
                <span className="text-2xl font-bold text-[#C6A85E]">{score}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                <div
                    className="h-full bg-gradient-to-r from-[#C6A85E] to-[#e5c377] rounded-full transition-all"
                    style={{ width: `${score}%` }}
                />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {fields.map((f) => (
                    <div key={f.key} className="flex items-center gap-2 text-sm">
                        {f.complete ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                        ) : (
                            <Circle className="h-4 w-4 text-gray-600 flex-shrink-0" />
                        )}
                        <span className={f.complete ? "text-gray-300" : "text-gray-500"}>{f.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── EXPERIENCE ───────────────────────────────────

export function ExperienceSection({
    items,
    isOwner,
}: {
    items: ProfileExperience[];
    isOwner: boolean;
}) {
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
        company: "",
        role: "",
        location: "",
        start_date: "",
        end_date: "",
        is_current: false,
        description: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.company || !form.role || !form.start_date) {
            return toast.error("Company, role, and start date are required");
        }
        startTransition(async () => {
            const result = await addExperience({
                company: form.company,
                role: form.role,
                location: form.location || undefined,
                start_date: form.start_date,
                end_date: form.end_date || undefined,
                is_current: form.is_current,
                description: form.description || undefined,
            });
            if (result.success) {
                toast.success("Experience added");
                setShowForm(false);
                window.location.reload();
            } else {
                toast.error(result.error ?? "Failed");
            }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this experience?")) return;
        startTransition(async () => {
            const result = await deleteExperience(id);
            if (result.success) {
                toast.success("Deleted");
                window.location.reload();
            } else toast.error(result.error ?? "Failed");
        });
    };

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#C6A85E]" />
                    Work Experience
                </h3>
                {isOwner && (
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        size="sm"
                        variant="outline"
                        className="border-white/10 hover:bg-white/10"
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add
                    </Button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-3 mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Company *</Label>
                            <Input
                                value={form.company}
                                onChange={(e) => setForm({ ...form, company: e.target.value })}
                                className="bg-black/20 border-white/10 text-white"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Role *</Label>
                            <Input
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="bg-black/20 border-white/10 text-white"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-gray-400">Location</Label>
                        <Input
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            className="bg-black/20 border-white/10 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Start date *</Label>
                            <Input
                                type="date"
                                value={form.start_date}
                                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                className="bg-black/20 border-white/10 text-white"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-400">End date</Label>
                            <Input
                                type="date"
                                value={form.end_date}
                                disabled={form.is_current}
                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                className="bg-black/20 border-white/10 text-white disabled:opacity-40"
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                            type="checkbox"
                            checked={form.is_current}
                            onChange={(e) => setForm({ ...form, is_current: e.target.checked })}
                        />
                        I currently work here
                    </label>
                    <Textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Describe your responsibilities..."
                        rows={3}
                        className="bg-black/20 border-white/10 text-white"
                    />
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isPending} size="sm" className="bg-[#C6A85E] text-black hover:bg-[#b5975a]">
                            Save
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)} className="border-white/10 hover:bg-white/10">
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {items.length === 0 ? (
                <p className="text-sm text-gray-500">
                    {isOwner ? "Add your work history to build credibility." : "No experience listed."}
                </p>
            ) : (
                <div className="space-y-4">
                    {items.map((exp) => (
                        <div key={exp.id} className="relative border-l-2 border-[#C6A85E]/30 pl-4 pb-2">
                            {isOwner && (
                                <button
                                    onClick={() => handleDelete(exp.id)}
                                    className="absolute top-0 right-0 p-1 rounded text-gray-600 hover:text-red-400"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                            <div className="absolute left-0 top-1.5 -translate-x-[5px] h-2 w-2 rounded-full bg-[#C6A85E]" />
                            <h4 className="text-white font-semibold">{exp.role}</h4>
                            <div className="text-sm text-[#C6A85E]">{exp.company}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                {format(new Date(exp.start_date), "MMM yyyy")} —{" "}
                                {exp.is_current ? "Present" : exp.end_date ? format(new Date(exp.end_date), "MMM yyyy") : "—"}
                                {exp.location && ` · ${exp.location}`}
                            </div>
                            {exp.description && (
                                <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap">{exp.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

// ─── EDUCATION ────────────────────────────────────

export function EducationSection({
    items,
    isOwner,
}: {
    items: ProfileEducation[];
    isOwner: boolean;
}) {
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
        institution: "",
        degree: "",
        field: "",
        start_year: "",
        end_year: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.institution) return toast.error("Institution is required");
        startTransition(async () => {
            const result = await addEducation({
                institution: form.institution,
                degree: form.degree || undefined,
                field: form.field || undefined,
                start_year: form.start_year ? Number(form.start_year) : undefined,
                end_year: form.end_year ? Number(form.end_year) : undefined,
            });
            if (result.success) {
                toast.success("Education added");
                setShowForm(false);
                window.location.reload();
            } else toast.error(result.error ?? "Failed");
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this education entry?")) return;
        startTransition(async () => {
            const result = await deleteEducation(id);
            if (result.success) {
                toast.success("Deleted");
                window.location.reload();
            } else toast.error(result.error ?? "Failed");
        });
    };

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[#C6A85E]" />
                    Education
                </h3>
                {isOwner && (
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        size="sm"
                        variant="outline"
                        className="border-white/10 hover:bg-white/10"
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add
                    </Button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-3 mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-gray-400">Institution *</Label>
                        <Input
                            value={form.institution}
                            onChange={(e) => setForm({ ...form, institution: e.target.value })}
                            className="bg-black/20 border-white/10 text-white"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Degree</Label>
                            <Input
                                value={form.degree}
                                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                                placeholder="B.Sc."
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Field</Label>
                            <Input
                                value={form.field}
                                onChange={(e) => setForm({ ...form, field: e.target.value })}
                                placeholder="Broadcast Engineering"
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Start year</Label>
                            <Input
                                type="number"
                                value={form.start_year}
                                onChange={(e) => setForm({ ...form, start_year: e.target.value })}
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-400">End year</Label>
                            <Input
                                type="number"
                                value={form.end_year}
                                onChange={(e) => setForm({ ...form, end_year: e.target.value })}
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isPending} size="sm" className="bg-[#C6A85E] text-black hover:bg-[#b5975a]">
                            Save
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)} className="border-white/10 hover:bg-white/10">
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {items.length === 0 ? (
                <p className="text-sm text-gray-500">
                    {isOwner ? "Share your educational background." : "No education listed."}
                </p>
            ) : (
                <div className="space-y-3">
                    {items.map((edu) => (
                        <div key={edu.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                            <div>
                                <h4 className="text-white font-semibold">{edu.institution}</h4>
                                <div className="text-sm text-[#C6A85E]">
                                    {[edu.degree, edu.field].filter(Boolean).join(" · ")}
                                </div>
                                {(edu.start_year || edu.end_year) && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {edu.start_year ?? ""} — {edu.end_year ?? "Present"}
                                    </div>
                                )}
                            </div>
                            {isOwner && (
                                <button
                                    onClick={() => handleDelete(edu.id)}
                                    className="p-1 rounded text-gray-600 hover:text-red-400"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

// ─── PORTFOLIO ────────────────────────────────────

export function PortfolioSection({
    items,
    isOwner,
}: {
    items: ProfilePortfolioItem[];
    isOwner: boolean;
}) {
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
        title: "",
        description: "",
        url: "",
        image_url: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title) return toast.error("Title is required");
        startTransition(async () => {
            const result = await addPortfolioItem({
                title: form.title,
                description: form.description || undefined,
                url: form.url || undefined,
                image_url: form.image_url || undefined,
            });
            if (result.success) {
                toast.success("Portfolio item added");
                setShowForm(false);
                window.location.reload();
            } else toast.error(result.error ?? "Failed");
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this portfolio item?")) return;
        startTransition(async () => {
            const result = await deletePortfolioItem(id);
            if (result.success) {
                toast.success("Deleted");
                window.location.reload();
            } else toast.error(result.error ?? "Failed");
        });
    };

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-[#C6A85E]" />
                    Portfolio
                </h3>
                {isOwner && (
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        size="sm"
                        variant="outline"
                        className="border-white/10 hover:bg-white/10"
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add
                    </Button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-3 mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-gray-400">Title *</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="bg-black/20 border-white/10 text-white"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-gray-400">Description</Label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={2}
                            className="bg-black/20 border-white/10 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Project URL</Label>
                            <Input
                                value={form.url}
                                onChange={(e) => setForm({ ...form, url: e.target.value })}
                                placeholder="https://..."
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Image URL</Label>
                            <Input
                                value={form.image_url}
                                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                placeholder="https://..."
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isPending} size="sm" className="bg-[#C6A85E] text-black hover:bg-[#b5975a]">
                            Save
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)} className="border-white/10 hover:bg-white/10">
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {items.length === 0 ? (
                <p className="text-sm text-gray-500">
                    {isOwner ? "Showcase your best work." : "No portfolio items listed."}
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="group relative rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/[0.07] transition-colors"
                        >
                            {isOwner && (
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-black/60 text-gray-300 hover:text-red-400"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                            {item.image_url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            )}
                            <div className="p-4">
                                <h4 className="font-semibold text-white line-clamp-1">{item.title}</h4>
                                {item.description && (
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                                )}
                                {item.url && (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-3 text-xs text-[#C6A85E] hover:underline"
                                    >
                                        View <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
