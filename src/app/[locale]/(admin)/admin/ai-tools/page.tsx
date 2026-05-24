import Link from "next/link";
import { Plus } from "lucide-react";
import {
    listAdminAiTools,
    listAdminAiToolCategories,
} from "@/features/admin/server/actions";
import { Button } from "@/components/ui/button";
import { AdminAiToolRow } from "./ai-tool-row";
import { AiToolCategoriesPanel } from "./categories-panel";

export default async function AdminAiToolsPage() {
    const [tools, categories] = await Promise.all([
        listAdminAiTools(),
        listAdminAiToolCategories(),
    ]);

    const categoryName = (id: string | null) =>
        categories.find((c) => c.id === id)?.name ?? "—";

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">AI Production Tools</h1>
                    <p className="mt-1 text-sm text-gray-400">{tools.length} tools</p>
                </div>
                <Link href="/admin/ai-tools/new">
                    <Button className="gap-2 bg-[var(--brand)] font-semibold text-black hover:bg-[#B5964A]">
                        <Plus className="h-4 w-4" />
                        Add AI Tool
                    </Button>
                </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                            <th className="p-4 text-left font-medium">Tool</th>
                            <th className="p-4 text-left font-medium">Category</th>
                            <th className="p-4 text-left font-medium">Status</th>
                            <th className="p-4 text-center font-medium">Featured</th>
                            <th className="p-4 text-right font-medium">Bookmarks</th>
                            <th className="p-4 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tools.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No AI tools yet
                                </td>
                            </tr>
                        ) : (
                            tools.map((t) => (
                                <AdminAiToolRow
                                    key={t.id}
                                    tool={t}
                                    categoryName={categoryName(t.category_id)}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AiToolCategoriesPanel categories={categories} />
        </div>
    );
}
