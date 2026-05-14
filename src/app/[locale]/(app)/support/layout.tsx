import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import { BookOpen, HelpCircle, Lightbulb, FileText, MessageSquare } from "lucide-react";
import { getDocArticles } from "@/features/docs/server/actions";
import type { DocCategory } from "@/features/docs/schema";

const SIDEBAR_SECTIONS: { category: DocCategory; icon: React.ElementType; labelKey: string }[] = [
  { category: "user-guide", icon: BookOpen,   labelKey: "gettingStarted" },
  { category: "feature",    icon: Lightbulb,  labelKey: "features" },
  { category: "faq",        icon: HelpCircle, labelKey: "faq" },
];

export default async function SupportLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("support");

  const allPublic = await getDocArticles({ publicOnly: true });
  const countsByCategory = allPublic.reduce<Partial<Record<DocCategory, number>>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-10 pb-16 block">
      <PageHeader heading={t("title")} text={t("subtitle")} />
      <Separator className="my-6 bg-white/10" />

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/support"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <FileText className="h-4 w-4 shrink-0" />
              {t("allArticles")}
            </Link>

            <Separator className="my-2 bg-white/5" />

            {SIDEBAR_SECTIONS.map(({ category, icon: Icon, labelKey }) => {
              const count = countsByCategory[category] ?? 0;
              return (
                <Link
                  key={category}
                  href={`/support/${category}`}
                  className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    {t(labelKey as "gettingStarted" | "features" | "faq")}
                  </span>
                  {count > 0 && (
                    <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}

            <Separator className="my-2 bg-white/5" />

            <Link
              href="/support/contact"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              {t("contactSupport")}
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
