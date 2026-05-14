
"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

interface FooterProps {
    isSidebar?: boolean;
}

export function Footer({ isSidebar = false }: FooterProps) {
    const year = new Date().getFullYear()
    const t = useTranslations("footer")

    if (isSidebar) {
        return (
            <footer className="w-full text-center py-2 bg-white/5 rounded-lg border border-white/5">
                <div className="text-[10px] text-gray-500 font-medium leading-none">
                    © {year} <span className="text-[#C6A85E]">MediaLinkPro</span>
                </div>
            </footer>
        )
    }

    return (
        <footer className="w-full py-6 px-4 md:px-8 border-t border-white/10 bg-black/50 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500">
                <div className="text-sm font-medium">
                    © {year} {t("copyright")} <span className="text-[#C6A85E]">MediaLinkPro</span>
                </div>
                <div className="text-sm">
                    {t("designedBy") + " "}
                    <Link
                        href="https://lazaarworks.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#C6A85E] transition-colors duration-200 underline underline-offset-4"
                    >
                        LazaarWorks
                    </Link>
                </div>
            </div>
        </footer>
    )
}
