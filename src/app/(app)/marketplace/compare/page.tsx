import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, Eye, Bookmark, Tag, Building2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Compare Products",
    description: "Side-by-side comparison of products on MediaLinkPro.",
};

type Props = { searchParams: Promise<{ ids?: string }> };

export default async function CompareProductsPage({ searchParams }: Props) {
    const { ids } = await searchParams;
    const productIds = (ids ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4);

    if (productIds.length === 0) {
        return <EmptyCompareState />;
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: products } = await supabase
        .from("products")
        .select("*, organizations(id, name, slug, logo_url)")
        .in("id", productIds);

    const ordered = productIds
        .map((id) => products?.find((p) => p.id === id))
        .filter(Boolean) as NonNullable<typeof products>;

    if (ordered.length === 0) {
        return <EmptyCompareState />;
    }

    const rows: { label: string; icon?: React.ReactNode; render: (p: (typeof ordered)[number]) => React.ReactNode }[] = [
        {
            label: "Category",
            icon: <Tag className="h-4 w-4" />,
            render: (p) => p.main_category ?? "—",
        },
        {
            label: "Type",
            render: (p) => p.product_type ?? "—",
        },
        {
            label: "Organization",
            icon: <Building2 className="h-4 w-4" />,
            render: (p) =>
                p.organizations ? (
                    <Link href={`/companies/${p.organizations.slug}`} className="text-[#C6A85E] hover:underline">
                        {p.organizations.name}
                    </Link>
                ) : (
                    "—"
                ),
        },
        {
            label: "Pricing",
            render: (p) => p.pricing_model ?? p.price ?? "On request",
        },
        {
            label: "Availability",
            render: (p) => p.availability ?? "—",
        },
        {
            label: "Views",
            icon: <Eye className="h-4 w-4" />,
            render: (p) => (p.views_count ?? 0).toLocaleString(),
        },
        {
            label: "Bookmarks",
            icon: <Bookmark className="h-4 w-4" />,
            render: (p) => (p.bookmarks_count ?? 0).toLocaleString(),
        },
        {
            label: "Demo available",
            render: (p) =>
                p.demo_url || p.demo_available ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                    <XCircle className="h-5 w-5 text-gray-600" />
                ),
        },
    ];

    return (
        <div className="space-y-6">
            <Link
                href="/marketplace/products"
                className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to marketplace
            </Link>

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Product Comparison</h1>
                <p className="text-sm text-gray-400">
                    Comparing {ordered.length} product{ordered.length > 1 ? "s" : ""} side-by-side.
                </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                <table className="w-full min-w-[720px]">
                    <thead>
                        <tr>
                            <th className="sticky left-0 bg-white/5 backdrop-blur p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-white/10 w-40">
                                &nbsp;
                            </th>
                            {ordered.map((p) => (
                                <th
                                    key={p.id}
                                    className="p-4 text-left border-b border-white/10 border-l border-white/5 min-w-[220px]"
                                >
                                    <div className="space-y-3">
                                        <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                                            {p.cover_image_url ? (
                                                <Image
                                                    src={p.cover_image_url}
                                                    alt={p.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-600 text-xs">
                                                    No image
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Link
                                                href={`/products/${p.slug}`}
                                                className="font-semibold text-white hover:text-[#C6A85E] line-clamp-2 block"
                                            >
                                                {p.name}
                                            </Link>
                                            {p.tagline && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.tagline}</p>
                                            )}
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.label} className="hover:bg-white/[0.02]">
                                <td className="sticky left-0 bg-white/5 backdrop-blur p-4 text-sm text-gray-300 border-b border-white/5 flex items-center gap-2">
                                    {row.icon && <span className="text-[#C6A85E]">{row.icon}</span>}
                                    {row.label}
                                </td>
                                {ordered.map((p) => (
                                    <td
                                        key={p.id}
                                        className="p-4 text-sm text-white border-b border-white/5 border-l border-white/5"
                                    >
                                        {row.render(p)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ordered.map((p) => (
                    <Link key={p.id} href={`/products/${p.slug}`}>
                        <Button variant="outline" className="w-full border-white/10 hover:bg-white/10">
                            View {p.name}
                        </Button>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function EmptyCompareState() {
    return (
        <div className="max-w-xl mx-auto text-center py-16 space-y-4">
            <h1 className="text-2xl font-bold text-white">Product Comparison</h1>
            <p className="text-gray-400">
                Select products to compare from the marketplace. Pass up to 4 product IDs in the{" "}
                <code className="text-[#C6A85E]">?ids=</code> parameter, separated by commas.
            </p>
            <Link href="/marketplace/products">
                <Button className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium">
                    Go to Marketplace
                </Button>
            </Link>
        </div>
    );
}
