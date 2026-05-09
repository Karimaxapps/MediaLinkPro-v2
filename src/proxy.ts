import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import { type NextRequest } from "next/server";

const handleI18n = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1. Run Supabase session refresh + auth guards
  const supabaseResponse = await updateSession(request);

  // If Supabase is redirecting (unauthenticated → /auth, authenticated → /dashboard)
  // return that redirect immediately
  if (supabaseResponse.status === 302 || supabaseResponse.status === 307) {
    return supabaseResponse;
  }

  // 2. Apply next-intl locale routing (browser Accept-Language detection + URL prefix)
  const intlResponse = handleI18n(request);

  // 3. Forward any Supabase session cookies to the intl response so auth stays valid
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - API routes (/api/...)
     * - Next.js internals (_next/static, _next/image)
     * - Static assets (favicon, images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|apple-icon|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
