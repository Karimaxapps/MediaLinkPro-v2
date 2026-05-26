import {
    requireSiteAdmin,
    listAdminAiToolCategories,
    listOrganizationsForSelect,
    createAiToolAsAdmin,
    updateAiToolAsAdmin,
} from "@/features/admin/server/actions";
import { AiToolForm } from "@/features/ai-tools/components/ai-tool-form";
import type { AiToolCategory } from "@/features/ai-tools/types";

export default async function AdminNewAiToolPage() {
    await requireSiteAdmin();
    const [categories, organizations] = await Promise.all([
        listAdminAiToolCategories(),
        listOrganizationsForSelect(),
    ]);

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
                organizations={organizations}
                createAction={createAiToolAsAdmin}
                updateAction={updateAiToolAsAdmin}
            />
        </div>
    );
}
