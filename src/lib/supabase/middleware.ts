
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // DEV BYPASS: skip Supabase auth entirely when connectivity is unavailable
    // Set DEV_BYPASS_AUTH=true in .env.local to enable
    if (
        process.env.NODE_ENV === "development" &&
        process.env.DEV_BYPASS_AUTH === "true"
    ) {
        return response;
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Strip non-default locale prefix (es, fr, de, zh) so path comparisons
    // work regardless of which locale is active. English has no prefix ("as-needed").
    const { pathname } = request.nextUrl;
    const localeMatch = pathname.match(/^\/(es|fr|de|zh|ja)(\/|$)/);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
    const cleanPath = localeMatch ? pathname.slice(localeMatch[1].length + 1) || "/" : pathname;

    // All routes that live inside src/app/[locale]/(app)/ — require authentication
    const APP_ROUTES = [
        "/advertising", "/billing", "/bookmarks", "/companies", "/connect",
        "/dashboard", "/events", "/experts", "/jobs", "/marketplace",
        "/messages", "/products", "/profile", "/profiles", "/search",
        "/settings", "/onboarding",
    ];

    const isAppRoute = APP_ROUTES.some(
        (r) => cleanPath === r || cleanPath.startsWith(r + "/")
    );

    if (isAppRoute && !user) {
        // Never redirect server-action POSTs: it breaks Next's action-response
        // forwarding and leaves requests hung until the server restarts
        // (https://github.com/vercel/next.js/discussions/64993). Actions do
        // their own auth checks and return empty results instead.
        if (request.headers.get("next-action")) {
            return response;
        }
        const url = request.nextUrl.clone();
        url.pathname = `${localePrefix}/auth`;
        return NextResponse.redirect(url);
    }

    // Auth route — redirect to dashboard if already signed in
    if ((cleanPath === "/auth" || cleanPath.startsWith("/auth/")) && user) {
        const url = request.nextUrl.clone();
        url.pathname = `${localePrefix}/dashboard`;
        return NextResponse.redirect(url);
    }

    return response;
}
