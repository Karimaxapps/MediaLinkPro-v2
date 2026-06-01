import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

const handleI18n = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 1. Run Supabase session refresh + auth guards
  const supabaseResponse = await updateSession(request);

  // If Supabase is redirecting (unauthenticated → /auth, authenticated → /dashboard)
  // return that redirect immediately
  if (supabaseResponse.status === 302 || supabaseResponse.status === 307) {
    return supabaseResponse;
  }

  // 2. Apply next-intl locale routing (browser Accept-Language detection + URL prefix)
  const intlResponse = handleI18n(request);

  // 3. Strip the internal Node.js port (3000) from redirect Location headers.
  //    Hostinger runs Next.js on :3000 behind nginx; if the proxy does not
  //    rewrite the Host header the redirect URL leaks :3000 to the browser.
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    const location = intlResponse.headers.get("Location");
    if (location) {
      try {
        const url = new URL(location);
        if (url.port === "3000") {
          url.port = "";
          return NextResponse.redirect(url.toString(), {
            status: intlResponse.status,
          });
        }
      } catch {
        // location is a relative URL — no port to strip
      }
    }
  }

  // 4. Forward any Supabase session cookies to the intl response so auth stays valid
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
     * - QR scan tracking route (/scan/... — locale-agnostic, redirects itself)
     * - App-association files (/.well-known/... — must be served raw, no locale)
     * - SEO metadata routes (sitemap.xml, robots.txt, llms.txt — must be served raw, no locale)
     * - Next.js internals (_next/static, _next/image)
     * - Static assets (favicon, images, etc.)
     */
    "/((?!api|scan|\\.well-known|sitemap\\.xml|robots\\.txt|llms\\.txt|_next/static|_next/image|favicon.ico|apple-icon|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
