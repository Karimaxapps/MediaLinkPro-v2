import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const supabaseUrl = process.env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
    return createServerClient(
        supabaseUrl,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
};

// Cookie-free anon client — safe to use inside `unstable_cache`/cached contexts
// (which forbid reading `cookies()`). Reads public data under RLS, no user session.
export const createAnonClient = () => {
    return createServerClient(
        supabaseUrl,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return [];
                },
                setAll() {
                    // No session cookies to manage for an anon client.
                },
            },
        }
    );
};

export const createAdminClient = () => {
    return createServerClient(
        supabaseUrl,
        env.SUPABASE_SERVICE_ROLE_KEY,
        {
            cookies: {
                getAll() {
                    return [];
                },
                setAll() {
                    // Service role client doesn't need to manage cookies
                },
            },
        }
    );
};

