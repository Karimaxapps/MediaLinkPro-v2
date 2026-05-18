import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { trackClick } from "@/features/advertising/server/actions";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // Look up the campaign and use its stored cta_url as the source of truth.
    // The `url` query param is ignored — trusting it would allow an open redirect:
    // an attacker could craft /api/ads/click?id=<any>&url=https://evil.example
    // and use our domain to bounce victims to phishing/malware.
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: campaign } = await supabase
        .from("ad_campaigns" as never)
        .select("cta_url, status")
        .eq("id", id)
        .single<{ cta_url: string | null; status: string }>();

    if (!campaign || !campaign.cta_url) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Reject non-http(s) protocols (javascript:, data:, file:, …)
    let target: URL;
    try {
        target = new URL(campaign.cta_url);
    } catch {
        return NextResponse.json({ error: "Invalid campaign URL" }, { status: 400 });
    }
    if (!["http:", "https:"].includes(target.protocol)) {
        return NextResponse.json({ error: "Invalid campaign URL" }, { status: 400 });
    }

    await trackClick(id).catch(() => undefined);
    return NextResponse.redirect(target.toString(), 302);
}
