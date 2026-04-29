import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
