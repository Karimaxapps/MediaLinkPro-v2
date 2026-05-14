import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BookOpen, HelpCircle, Lightbulb, ChevronRight, MessageSquare } from "lucide-react";
import { getDocArticles } from "@/features/docs/server/actions";

export default async function SupportHomePage() {
  const t = await getTranslations("support");
  const articles = await getDocArticles({ publicOnly: true });

  const recent = articles.slice(0, 6);

  const sections = [
    {
      href: "/support/user-guide",
      icon: BookOpen,
      label: t("gettingStarted"),
      description: t("gettingStartedDesc"),
      color: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
    },
    {
      href: "/support/feature",
      icon: Lightbulb,
      label: t("features"),
      description: t("featuresDesc"),
      color: "text-purple-400",
      border: "border-purple-500/20",
      bg: "bg-purple-500/10",
    },
    {
      href: "/support/faq",
      icon: HelpCircle,
      label: t("faq"),
      description: t("faqDesc"),
      color: "text-blue-400",
      border: "border-blue-500/20",
      bg: "bg-blue-500/10",
    },
    {
      href: "/support/contact",
      icon: MessageSquare,
      label: t("contactSupport"),
      description: t("contactSupportDesc"),
      color: "text-[#C6A85E]",
      border: "border-[#C6A85E]/20",
      bg: "bg-[#C6A85E]/10",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Quick nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(({ href, icon: Icon, label, description, color, border, bg }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-xl border ${border} ${bg} p-5 hover:opacity-80 transition-opacity space-y-2`}
          >
            <Icon className={`h-5 w-5 ${color}`} />
            <div className={`text-sm font-semibold ${color}`}>{label}</div>
            <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
          </Link>
        ))}
      </div>

      {/* Recent articles */}
      {recent.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            {t("recentArticles")}
          </h2>
          <div className="divide-y divide-white/5 rounded-xl border border-white/10 overflow-hidden">
            {recent.map((article) => (
              <Link
                key={article.id}
                href={`/support/article/${article.slug}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors group"
              >
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-[#C6A85E] transition-colors">
                    {article.title}
                  </div>
                  {article.excerpt && (
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{article.excerpt}</div>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-[#C6A85E] shrink-0 ml-4 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {articles.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-gray-400 text-sm">{t("noArticles")}</p>
          <Link
            href="/support/contact"
            className="mt-4 inline-flex items-center gap-1.5 text-[#C6A85E] text-sm hover:underline"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {t("contactSupport")}
          </Link>
        </div>
      )}
    </div>
  );
}
