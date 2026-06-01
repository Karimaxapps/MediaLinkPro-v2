import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
    ArrowLeft,
    ExternalLink,
    Sparkles,
    Tag,
    BookOpen,
    GraduationCap,
    Youtube,
    Users,
    FileText,
    Globe,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    getAiToolBySlug,
    getAiToolBookmarkStatus,
} from "@/features/ai-tools/server/actions";
import { AiToolBookmarkButton } from "@/features/ai-tools/components/ai-tool-bookmark-button";
import { PRICING_MODEL_LABELS, RESOURCE_TYPE_LABELS } from "@/features/ai-tools/constants";
import type { AiToolResource } from "@/features/ai-tools/types";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/seo";

const RESOURCE_ICONS: Record<string, typeof BookOpen> = {
    documentation: BookOpen,
    tutorial: GraduationCap,
    youtube: Youtube,
    community: Users,
    article: FileText,
    official_link: Globe,
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const tool = await getAiToolBySlug(slug);
    if (!tool) return { title: "AI Tool Not Found" };
    return {
        title: `${tool.name} | AI Production Tools`,
        description: tool.tagline ?? undefined,
        alternates: { canonical: `/ai-tools/${tool.slug ?? slug}` },
    };
}

export default async function AiToolDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const tool = await getAiToolBySlug(slug);

    if (!tool || tool.status !== "published") {
        notFound();
    }

    const bookmarkStatus = await getAiToolBookmarkStatus(tool.id);
    const resources = tool.ai_tool_resources ?? [];

    const grouped = resources.reduce<Record<string, AiToolResource[]>>((acc, r) => {
        (acc[r.resource_type] ||= []).push(r);
        return acc;
    }, {});

    const heroImage = tool.cover_image_url || tool.gallery_urls?.[0] || "";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        applicationCategory: "AI production tool",
        url: absoluteUrl(`/ai-tools/${tool.slug}`),
        ...(tool.tagline || tool.description
            ? { description: tool.tagline || tool.description }
            : {}),
        ...(tool.logo_url || heroImage ? { image: tool.logo_url || heroImage } : {}),
        ...(tool.platforms && tool.platforms.length > 0
            ? { operatingSystem: tool.platforms.join(", ") }
            : {}),
        ...(tool.pricing_model === "free"
            ? { offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }
            : {}),
    };

    return (
        <div className="container mx-auto max-w-5xl space-y-8 py-8">
            <JsonLd data={jsonLd} />
            <Link
                href="/ai-tools"
                className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to AI Tools
            </Link>

            {/* Hero */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="relative h-56 w-full bg-gray-900 sm:h-72">
                    {heroImage ? (
                        <img src={heroImage} alt={tool.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--brand)]/10 to-black">
                            <Sparkles className="h-16 w-16 text-[var(--brand)]/40" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                </div>

                <div className="space-y-4 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {tool.logo_url && (
                                <img
                                    src={tool.logo_url}
                                    alt={tool.name}
                                    className="h-16 w-16 rounded-lg border border-white/10 bg-black/40 object-contain p-1"
                                />
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                    {tool.name}
                                </h1>
                                {tool.tagline && (
                                    <p className="mt-1 text-gray-400">{tool.tagline}</p>
                                )}
                                {tool.organization && (
                                    <Link
                                        href={`/companies/${tool.organization.slug}`}
                                        className="mt-2 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src={tool.organization.logo_url ?? undefined} alt={tool.organization.name} />
                                            <AvatarFallback className="text-[9px] bg-white/10 text-gray-400">
                                                {tool.organization.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{tool.organization.name}</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <AiToolBookmarkButton
                                aiToolId={tool.id}
                                initialBookmarked={bookmarkStatus.bookmarked}
                                initialCount={bookmarkStatus.count}
                                showCount
                            />
                            <a href={tool.main_link} target="_blank" rel="noopener noreferrer">
                                <Button className="gap-2 bg-[var(--brand)] font-semibold text-black hover:bg-[#B5964A]">
                                    Visit Tool
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {tool.ai_tool_categories?.name && (
                            <Badge className="border border-white/10 bg-white/10 text-white">
                                {tool.ai_tool_categories.name}
                            </Badge>
                        )}
                        {tool.pricing_model && (
                            <Badge
                                variant="outline"
                                className="border-[var(--brand)]/30 bg-transparent text-[var(--brand)]"
                            >
                                {PRICING_MODEL_LABELS[tool.pricing_model] ?? tool.pricing_model}
                            </Badge>
                        )}
                        {tool.platforms?.map((p) => (
                            <span
                                key={p}
                                className="rounded bg-white/5 px-2 py-0.5 text-xs text-gray-400"
                            >
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Description */}
            {tool.description && (
                <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <h2 className="mb-3 text-lg font-semibold text-white">About</h2>
                    <p className="whitespace-pre-wrap leading-relaxed text-gray-300">
                        {tool.description}
                    </p>
                </section>
            )}

            {/* Tags */}
            {tool.tags && tool.tags.length > 0 && (
                <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                        <Tag className="h-4 w-4 text-[var(--brand)]" />
                        Tags
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {tool.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-white/5 px-3 py-1 text-sm text-gray-300"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Gallery */}
            {tool.gallery_urls && tool.gallery_urls.length > 0 && (
                <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <h2 className="mb-4 text-lg font-semibold text-white">Gallery</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {tool.gallery_urls.map((url) => (
                            <img
                                key={url}
                                src={url}
                                alt={tool.name}
                                className="h-40 w-full rounded-lg border border-white/10 object-cover"
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Community resources */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Community Resources</h2>
                {resources.length === 0 ? (
                    <p className="text-sm text-gray-500">No resources added yet.</p>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(grouped).map(([type, items], idx) => {
                            const Icon = RESOURCE_ICONS[type] ?? Globe;
                            return (
                                <div key={type}>
                                    {idx > 0 && <Separator className="mb-6 bg-white/10" />}
                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-[var(--brand)]">
                                        <Icon className="h-4 w-4" />
                                        {RESOURCE_TYPE_LABELS[type] ?? type}
                                    </h3>
                                    <ul className="space-y-2">
                                        {items.map((r) => (
                                            <li key={r.id}>
                                                <a
                                                    href={r.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:border-[var(--brand)]/40 hover:text-white"
                                                >
                                                    <span className="flex-1">{r.title}</span>
                                                    <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
