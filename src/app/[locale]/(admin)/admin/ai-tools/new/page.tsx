import {
    requireSiteAdmin,
    listAdminAiToolCategories,
    createAiToolAsAdmin,
    updateAiToolAsAdmin,
} from "@/features/admin/server/actions";
import { AiToolForm } from "@/features/ai-tools/components/ai-tool-form";
import type { AiToolCategory } from "@/features/ai-tools/types";

export default async function AdminNewAiToolPage() {
    await requireSiteAdmin();
    const categories = await listAdminAiToolCategories();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Add AI Tool</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Add an AI tool or platform to the curated directory.
                </p>
            </div>

            <AiToolForm
                categories={categories as AiToolCategory[]}
                createAction={createAiToolAsAdmin}
                updateAction={updateAiToolAsAdmin}
            />
        </div>
    );
}
