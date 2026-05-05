import { globalSearch } from "@/features/search/server/actions";
import { SearchResultsClient } from "@/features/search/components/search-results-client";
import type { Metadata } from "next";

type SearchPageProps = {
    searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const params = await searchParams;
    const query = params.q || "";
    return {
        title: query ? `Search: ${query}` : "Search",
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const query = params.q || "";
    const results = query.length >= 2 ? await globalSearch(query) : null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Search Results</h1>
                {query && (
                    <p className="text-gray-400 mt-1">
                        Showing results for &quot;{query}&quot;
                    </p>
                )}
            </div>
            <SearchResultsClient initialQuery={query} initialResults={results} />
        </div>
    );
}
