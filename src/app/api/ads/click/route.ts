import { NextRequest, NextResponse } from "next/server";
import { trackClick } from "@/features/advertising/server/actions";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const url = searchParams.get("url");

    if (!id || !url) {
        return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // Only allow absolute URLs to prevent open redirect to internal routes
    try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    await trackClick(id).catch(() => undefined);
    return NextResponse.redirect(url, 302);
}
