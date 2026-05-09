import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "For You", href: "/#for-you" },
  { label: "Features", href: "/#features" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

export function PublicNav({ activePath }: { activePath?: string }) {
  return (
    <nav className="sticky top-0 z-30 backdrop-blur-md bg-[#0B0B0B]/70 border-b border-white/5">
      <div className="relative flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold text-[#C6A85E]">
          MediaLinkPro
        </Link>

        <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                activePath === link.href
                  ? "text-sm font-medium text-[#C6A85E]"
                  : "text-sm font-medium text-gray-400 hover:text-[#C6A85E] transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/auth" className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/auth">
            <Button className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold px-6 rounded-full">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
