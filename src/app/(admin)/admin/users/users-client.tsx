"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toggleUserAdmin } from "@/features/admin/server/actions";

type AdminUser = {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
    country: string | null;
    created_at: string | null;
    is_admin: boolean | null;
};

export function AdminUsersClient({ users, initialQuery }: { users: AdminUser[]; initialQuery: string }) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);
    const [isPending, startTransition] = useTransition();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/admin/users?q=${encodeURIComponent(query)}`);
    };

    const handleToggle = (userId: string, value: boolean) => {
        startTransition(async () => {
            const result = await toggleUserAdmin(userId, value);
            if (!result.success) {
                toast.error(result.error ?? "Failed to update");
            } else {
                toast.success(value ? "Granted admin" : "Revoked admin");
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Users</h1>
                    <p className="text-sm text-gray-400 mt-1">{users.length} users shown</p>
                </div>
                <form onSubmit={handleSearch} className="flex gap-2 w-80">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name or username..."
                        className="bg-white/5 border-white/10"
                    />
                    <Button type="submit" variant="outline" className="border-white/10">
                        Search
                    </Button>
                </form>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                            <th className="text-left p-4 font-medium">User</th>
                            <th className="text-left p-4 font-medium">Location</th>
                            <th className="text-left p-4 font-medium">Joined</th>
                            <th className="text-right p-4 font-medium">Admin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={u.avatar_url ?? undefined} />
                                                <AvatarFallback className="bg-[#C6A85E] text-black text-xs">
                                                    {(u.full_name ?? u.username ?? "?")[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-sm font-medium text-white">
                                                    {u.full_name ?? "Unknown"}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    @{u.username ?? u.id.slice(0, 8)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {[u.city, u.country].filter(Boolean).join(", ") || "—"}
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Switch
                                            checked={!!u.is_admin}
                                            disabled={isPending}
                                            onCheckedChange={(v) => handleToggle(u.id, v)}
                                        />
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
