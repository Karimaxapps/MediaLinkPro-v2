import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getLocale } from "next-intl/server";
import { getThemeSettings } from "@/features/admin/server/theme-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://medialinkpro.net";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MediaLinkPro — Connect, Discover & Collaborate in Media",
    template: "%s | MediaLinkPro",
  },
  description:
    "The professional platform for the media industry. Connect with broadcasters, solution providers, production companies, and media experts. Discover products, showcase expertise, and grow your network.",
  keywords: [
    "media industry",
    "broadcast technology",
    "media professionals",
    "production companies",
    "media solutions",
    "networking platform",
  ],
  authors: [{ name: "MediaLinkPro" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MediaLinkPro",
    title: "MediaLinkPro — Connect, Discover & Collaborate in Media",
    description:
      "The professional platform for the media industry. Connect with broadcasters, solution providers, production companies, and media experts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MediaLinkPro — Connect, Discover & Collaborate in Media",
    description:
      "The professional platform for the media industry. Connect with broadcasters, solution providers, production companies, and media experts.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Dynamically set html[lang] from the active locale (detected via browser Accept-Language)
  const locale = await getLocale();
  const theme = await getThemeSettings();
  const esc = (s: string) => s.replace(/[<>]/g, "");
  const themeCss = `:root{--brand:${esc(theme.brand)};--brand-secondary:${esc(theme.brand_secondary)};--brand-success:${esc(theme.brand_success)};--brand-warning:${esc(theme.brand_warning)};--brand-destructive:${esc(theme.brand_destructive)};}`;

  return (
    <html lang={locale}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
