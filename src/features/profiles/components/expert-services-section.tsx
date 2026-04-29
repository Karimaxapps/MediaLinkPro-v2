"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, DollarSign, Plus, Trash2, Briefcase } from "lucide-react";
import type { ExpertService } from "../server/expert-actions";
import { createExpertService, deleteExpertService } from "../server/expert-actions";

export function ExpertServicesSection({
    initialServices,
    hourlyRate,
    isOwner,
}: {
    initialServices: ExpertService[];
    hourlyRate: number | null;
    isOwner: boolean;
}) {
    const [services, setServices] = useState(initialServices);
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        duration_minutes: "",
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return toast.error("Title is required");

        startTransition(async () => {
            const result = await createExpertService({
                title: form.title,
                description: form.description || undefined,
                price: form.price ? Number(form.price) : undefined,
                duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
            });
            if (result.success) {
                toast.success("Service added");
                setForm({ title: "", description: "", price: "", duration_minutes: "" });
                setShowForm(false);
                // Optimistic: add a placeholder until refresh
                window.location.reload();
            } else {
                toast.error(result.error ?? "Failed to add service");
            }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this service?")) return;
        startTransition(async () => {
            const result = await deleteExpertService(id);
            if (result.success) {
                setServices((s) => s.filter((x) => x.id !== id));
                toast.success("Service deleted");
            } else {
                toast.error(result.error ?? "Failed to delete");
            }
        });
    };

    return (
        <div className="space-y-6">
            {hourlyRate != null && hourlyRate > 0 && (
                <div className="rounded-xl border border-[#C6A85E]/30 bg-[#C6A85E]/5 p-5">
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-6 w-6 text-[#C6A85E]" />
                        <div>
                            <div className="text-xs uppercase tracking-wide text-gray-400">Hourly Rate</div>
                            <div className="text-2xl font-bold text-white">${hourlyRate}/hr</div>
                        </div>
                    </div>
                </div>
            )}

            {isOwner && (
                <div className="flex justify-end">
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium"
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Service
                    </Button>
                </div>
            )}

            {showForm && (
                <form
                    onSubmit={handleCreate}
                    className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5"
                >
                    <div className="space-y-2">
                        <Label className="text-gray-300">Title *</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="1-hour consultation"
                            className="bg-black/20 border-white/10 text-white"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-300">Description</Label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                            className="bg-black/20 border-white/10 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Price (USD)</Label>
                            <Input
                                type="number"
                                min="0"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Duration (min)</Label>
                            <Input
                                type="number"
                                min="1"
                                value={form.duration_minutes}
                                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isPending} className="bg-[#C6A85E] text-black hover:bg-[#b5975a]">
                            {isPending ? "Saving..." : "Save Service"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowForm(false)}
                            className="border-white/10 hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {services.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-lg border border-dashed border-white/10">
                    <Briefcase className="mx-auto h-10 w-10 text-gray-600 mb-2" />
                    <p className="text-gray-400">
                        {isOwner ? "Add your first service offering." : "No services listed yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((svc) => (
                        <div
                            key={svc.id}
                            className="group relative rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.07] transition-colors"
                        >
                            {isOwner && (
                                <button
                                    onClick={() => handleDelete(svc.id)}
                                    className="absolute top-3 right-3 p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                            <h4 className="font-semibold text-white pr-8">{svc.title}</h4>
                            {svc.description && (
                                <p className="text-sm text-gray-400 mt-2 line-clamp-3">{svc.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
                                {svc.price != null && (
                                    <div className="flex items-center gap-1 text-sm text-[#C6A85E] font-medium">
                                        <DollarSign className="h-3.5 w-3.5" />
                                        {svc.price} {svc.currency}
                                    </div>
                                )}
                                {svc.duration_minutes && (
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock className="h-3.5 w-3.5" />
                                        {svc.duration_minutes} min
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
