"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type AnalyticsPoint = { date: string; views: number; scans: number };

export type ProductAnalytics = {
    totalViews: number;
    uniqueViews: number;
    totalScans: number;
    bookmarks: number;
    demoRequests: number;
    conversionRate: number;
    timeseries: AnalyticsPoint[];
    previousViews: number;
    previousScans: number;
};

function dateKey(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function buildDateRange(days: number): string[] {
    const out: string[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setUTCHours(0, 0, 0, 0);
        d.setUTCDate(d.getUTCDate() - i);
        out.push(dateKey(d));
    }
    return out;
}

export async function getProductAnalytics(
    productId: string,
    days: number = 30
): Promise<ProductAnalytics> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const now = new Date();
    const since = new Date(now);
    since.setUTCDate(since.getUTCDate() - days);
    const sinceIso = since.toISOString();

    const prevSince = new Date(since);
    prevSince.setUTCDate(prevSince.getUTCDate() - days);
    const prevSinceIso = prevSince.toISOString();

    const [viewsRes, scansRes, prevViewsRes, prevScansRes, productRes, demoRes] = await Promise.all([
        supabase
            .from("product_views")
            .select("created_at, user_id, visitor_id")
            .eq("product_id", productId)
            .gte("created_at", sinceIso),
        supabase
            .from("product_scans")
            .select("scanned_at, scanner_id")
            .eq("product_id", productId)
            .gte("scanned_at", sinceIso),
        supabase
            .from("product_views")
            .select("id", { count: "exact", head: true })
            .eq("product_id", productId)
            .gte("created_at", prevSinceIso)
            .lt("created_at", sinceIso),
        supabase
            .from("product_scans")
            .select("id", { count: "exact", head: true })
            .eq("product_id", productId)
            .gte("scanned_at", prevSinceIso)
            .lt("scanned_at", sinceIso),
        supabase
            .from("products")
            .select("views_count, bookmarks_count, qr_scans_count")
            .eq("id", productId)
            .single(),
        supabase
            .from("demo_requests")
            .select("id", { count: "exact", head: true })
            .eq("product_id", productId)
            .gte("created_at", sinceIso),
    ]);

    const views = viewsRes.data ?? [];
    const scans = scansRes.data ?? [];

    // Build timeseries
    const range = buildDateRange(days);
    const viewsByDay = new Map<string, number>();
    const scansByDay = new Map<string, number>();

    for (const v of views) {
        const k = dateKey(new Date(v.created_at));
        viewsByDay.set(k, (viewsByDay.get(k) ?? 0) + 1);
    }
    for (const s of scans) {
        const k = dateKey(new Date(s.scanned_at));
        scansByDay.set(k, (scansByDay.get(k) ?? 0) + 1);
    }

    const timeseries: AnalyticsPoint[] = range.map((d) => ({
        date: d,
        views: viewsByDay.get(d) ?? 0,
        scans: scansByDay.get(d) ?? 0,
    }));

    const totalViews = views.length;
    const uniqueViewers = new Set(
        views.map((v) => v.user_id ?? v.visitor_id).filter(Boolean)
    );
    const uniqueViews = uniqueViewers.size;
    const totalScans = scans.length;
    const demoRequests = demoRes.count ?? 0;
    const bookmarks = productRes.data?.bookmarks_count ?? 0;
    const conversionRate = totalViews > 0 ? (demoRequests / totalViews) * 100 : 0;

    return {
        totalViews,
        uniqueViews,
        totalScans,
        bookmarks,
        demoRequests,
        conversionRate,
        timeseries,
        previousViews: prevViewsRes.count ?? 0,
        previousScans: prevScansRes.count ?? 0,
    };
}
