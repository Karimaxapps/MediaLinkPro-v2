import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Supported locales
  locales: ["en", "es", "fr", "de", "zh"],

  // Default locale — shown without a URL prefix (e.g. /pricing instead of /en/pricing)
  defaultLocale: "en",

  // 'as-needed': default locale has no prefix; other locales get /es/, /fr/, etc.
  localePrefix: "as-needed",

  // Detect locale from browser's Accept-Language header (true by default)
  // Falls back to defaultLocale ('en') if no match is found
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
