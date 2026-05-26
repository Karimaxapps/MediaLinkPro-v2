import type { Metadata } from "next";
import { getPublishedAiTools, getAiToolCategories } from "@/features/ai-tools/server/actions";
import { AiToolsClient } from "@/features/ai-tools/components/ai-tools-client";

export const metadata: Metadata = {
    title: "AI Production Tools | MediaLinkPro",
    description: "Discover AI tools and platforms for media production.",
};

export default async function AiToolsPage() {
    const [tools, categories] = await Promise.all([
        getPublishedAiTools(),
        getAiToolCategories(),
    ]);

    return <AiToolsClient tools={tools} categories={categories} />;
}
