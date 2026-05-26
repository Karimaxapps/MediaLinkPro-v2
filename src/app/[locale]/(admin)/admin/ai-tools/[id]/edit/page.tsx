import { redirect } from "next/navigation";
import {
    requireSiteAdmin,
    listAdminAiToolCategories,
    listOrganizationsForSelect,
    getAdminAiToolById,
    createAiToolAsAdmin,
    updateAiToolAsAdmin,
} from "@/features/admin/server/actions";
import { AiToolForm } from "@/features/ai-tools/components/ai-tool-form";
import type { AiTool, AiToolCategory } from "@/features/ai-tools/types";

export default async function AdminEditAiToolPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    await requireSiteAdmin();
    const { id } = await params;

    const [categories, organizations, tool] = await Promise.all([
        listAdminAiToolCategories(),
        listOrganizationsForSelect(),
        getAdminAiToolById(id),
    ]);

    if (!tool) {
        redirect("/admin/ai-tools");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Edit AI Tool</h1>
                <p className="mt-1 text-sm text-gray-400">Update this AI tool&apos;s details.</p>
            </div>

            <AiToolForm
                categories={categories as AiToolCategory[]}
                organizations={organizations}
                createAction={createAiToolAsAdmin}
                updateAction={updateAiToolAsAdmin}
                initialData={tool as unknown as AiTool}
            />
        </div>
    );
}
