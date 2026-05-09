"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Trash2 } from "lucide-react";
import { deleteOrganizationAsAdmin } from "@/features/admin/server/actions";

type Company = {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    created_at: string | null;
    type: string | null;
    country: string | null;
};

export function AdminCompaniesClient({ companies, initialQuery }: { companies: Company[]; initialQuery: string }) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);
    const [isPending, startTransition] = useTransition();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/admin/companies?q=${encodeURIComponent(query)}`);
    };

    const handleDelete = (company: Company) => {
        if (!confirm(`Delete "${company.name}"? This will remove all associated data. This cannot be undone.`)) return;
        startTransition(async () => {
            const result = await deleteOrganizationAsAdmin(company.id);
            if (!result.success) toast.error(result.error ?? "Failed to delete");
            else {
                toast.success("Company deleted");
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Companies</h1>
                    <p className="text-sm text-gray-400 mt-1">{companies.length} companies shown</p>
                </div>
                <form onSubmit={handleSearch} className="flex gap-2 w-80">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                    <Button type="submit" variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/10">
                        Search
                    </Button>
                </form>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                            <th className="text-left p-4 font-medium">Company</th>
                            <th className="text-left p-4 font-medium">Type</th>
                            <th className="text-left p-4 font-medium">Country</th>
                            <th className="text-left p-4 font-medium">Created</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">No companies found</td>
                            </tr>
                        ) : (
                            companies.map((c) => (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 rounded-lg">
                                                <AvatarImage src={c.logo_url ?? undefined} />
                                                <AvatarFallback className="bg-[#C6A85E]/20 text-[#C6A85E] text-xs font-semibold rounded-lg">
                                                    {c.name[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-sm font-medium text-white">{c.name}</div>
                                                <div className="text-xs text-gray-500">/{c.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">{c.type ?? "—"}</td>
                                    <td className="p-4 text-sm text-gray-400">{c.country ?? "—"}</td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/companies/${c.slug}`} target="_blank">
                                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                disabled={isPending}
                                                onClick={() => handleDelete(c)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
