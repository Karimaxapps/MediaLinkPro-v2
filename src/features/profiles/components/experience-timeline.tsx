"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Briefcase, Plus, Trash2, Building2, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    addExperience,
    deleteExperience,
    type ProfileExperience,
} from "@/features/profiles/server/profile-details-actions";

interface ExperienceTimelineProps {
    experiences: ProfileExperience[];
    /** Whether the viewer can edit (i.e. is the profile owner). */
    isOwner: boolean;
}

function formatYearRange(startDate: string, endDate: string | null, isCurrent: boolean): string {
    const startYear = new Date(startDate).getFullYear();
    if (isCurrent || !endDate) return `${startYear} – Present`;
    const endYear = new Date(endDate).getFullYear();
    if (startYear === endYear) return `${startYear}`;
    return `${startYear} – ${endYear}`;
}

function formatMonthYear(d: string): string {
    return format(new Date(d), "MMM yyyy");
}

export function ExperienceTimeline({ experiences, isOwner }: ExperienceTimelineProps) {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[var(--brand)]/10 rounded-lg">
                        <Briefcase className="h-4 w-4 text-[var(--brand)]" />
                    </div>
                    <CardTitle className="text-lg text-white font-bold">Experience</CardTitle>
                </div>
                {isOwner && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold h-8"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add
                            </Button>
                        </DialogTrigger>
                        <AddExperienceDialog onClose={() => setDialogOpen(false)} />
                    </Dialog>
                )}
            </CardHeader>
            <CardContent>
                {experiences.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        {isOwner
                            ? "No experience added yet. Click \"Add\" to share your career story."
                            : "No experience listed yet."}
                    </div>
                ) : (
                    <ol className="relative border-l border-white/10 ml-3 space-y-6">
                        {experiences.map((exp) => (
                            <ExperienceItem key={exp.id} experience={exp} isOwner={isOwner} />
                        ))}
                    </ol>
                )}
            </CardContent>
        </Card>
    );
}

function ExperienceItem({
    experience,
    isOwner,
}: {
    experience: ProfileExperience;
    isOwner: boolean;
}) {
    const [isPending, startTransition] = useTransition();
    const yearRange = formatYearRange(
        experience.start_date,
        experience.end_date,
        experience.is_current,
    );
    const monthRange = `${formatMonthYear(experience.start_date)} – ${
        experience.is_current || !experience.end_date
            ? "Present"
            : formatMonthYear(experience.end_date)
    }`;

    function handleDelete() {
        if (!confirm("Delete this experience entry?")) return;
        startTransition(async () => {
            await deleteExperience(experience.id);
        });
    }

    return (
        <li className="ml-6 group">
            {/* Timeline node */}
            <span className="absolute -left-[7px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--brand)] ring-4 ring-[#0B0B0B]" />

            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 hover:border-[var(--brand)]/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white">
                            {experience.role}
                            {experience.is_current && (
                                <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--brand)]/15 text-[var(--brand)] rounded">
                                    Current
                                </span>
                            )}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1.5">
                                <Building2 className="h-3 w-3 text-[var(--brand)]" />
                                <span className="text-gray-300">{experience.company}</span>
                            </span>
                            <span
                                className="flex items-center gap-1.5"
                                title={monthRange}
                            >
                                <Calendar className="h-3 w-3 text-[var(--brand)]" />
                                {yearRange}
                            </span>
                            {experience.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3 text-[var(--brand)]" />
                                    {experience.location}
                                </span>
                            )}
                        </div>
                    </div>
                    {isOwner && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                            aria-label="Delete experience"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                {experience.description && (
                    <p className="mt-2.5 text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                        {experience.description}
                    </p>
                )}
            </div>
        </li>
    );
}

function AddExperienceDialog({ onClose }: { onClose: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [isCurrent, setIsCurrent] = useState(false);

    function handleSubmit(formData: FormData) {
        setError(null);
        const role = (formData.get("role") as string)?.trim();
        const company = (formData.get("company") as string)?.trim();
        const startYearStr = (formData.get("start_year") as string)?.trim();
        const endYearStr = (formData.get("end_year") as string)?.trim();
        const description = (formData.get("description") as string)?.trim();

        if (!role || !company || !startYearStr) {
            setError("Job title, company and start year are required.");
            return;
        }

        const startYear = parseInt(startYearStr, 10);
        const endYear = endYearStr ? parseInt(endYearStr, 10) : null;
        const currentYear = new Date().getFullYear();

        if (Number.isNaN(startYear) || startYear < 1900 || startYear > currentYear + 1) {
            setError("Enter a valid start year.");
            return;
        }
        if (!isCurrent) {
            if (endYear === null) {
                setError("Set an end year or check \"I currently work here\".");
                return;
            }
            if (Number.isNaN(endYear) || endYear < startYear || endYear > currentYear + 1) {
                setError("End year must be a valid year on or after the start year.");
                return;
            }
        }

        // Convert years → ISO dates (Jan 1 of start year, Dec 31 of end year).
        const startDate = `${startYear}-01-01`;
        const endDate = isCurrent ? undefined : `${endYear}-12-31`;

        startTransition(async () => {
            const result = await addExperience({
                role,
                company,
                start_date: startDate,
                end_date: endDate,
                is_current: isCurrent,
                description: description || undefined,
            });
            if (!result.success) {
                setError(result.error || "Could not save experience.");
                return;
            }
            onClose();
        });
    }

    return (
        <DialogContent className="bg-[#0B0B0B] border-white/10 text-white sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle className="text-white">Add Experience</DialogTitle>
                <DialogDescription className="text-gray-400">
                    Share a role you've held. Visible on your public profile.
                </DialogDescription>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-300">
                        Job title <span className="text-[var(--brand)]">*</span>
                    </Label>
                    <Input
                        id="role"
                        name="role"
                        placeholder="Senior Producer"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="company" className="text-gray-300">
                        Company <span className="text-[var(--brand)]">*</span>
                    </Label>
                    <Input
                        id="company"
                        name="company"
                        placeholder="MediaLinkPro"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label htmlFor="start_year" className="text-gray-300">
                            Start year <span className="text-[var(--brand)]">*</span>
                        </Label>
                        <Input
                            id="start_year"
                            name="start_year"
                            type="number"
                            min={1900}
                            max={new Date().getFullYear() + 1}
                            placeholder="2020"
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end_year" className="text-gray-300">
                            End year
                        </Label>
                        <Input
                            id="end_year"
                            name="end_year"
                            type="number"
                            min={1900}
                            max={new Date().getFullYear() + 1}
                            placeholder="2024"
                            disabled={isCurrent}
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 disabled:opacity-40"
                        />
                    </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                        checked={isCurrent}
                        onCheckedChange={(v) => setIsCurrent(v === true)}
                        className="border-white/20 data-[state=checked]:bg-[var(--brand)] data-[state=checked]:text-black data-[state=checked]:border-[var(--brand)]"
                    />
                    <span className="text-sm text-gray-300">I currently work here</span>
                </label>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-300">
                        Short description
                    </Label>
                    <Textarea
                        id="description"
                        name="description"
                        rows={3}
                        maxLength={500}
                        placeholder="What did you do? Key achievements, scope, technologies…"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 resize-none"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
                        {error}
                    </p>
                )}

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="bg-transparent border-white/10 text-white hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold"
                    >
                        {isPending ? "Saving…" : "Save experience"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
