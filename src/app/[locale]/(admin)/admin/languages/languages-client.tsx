"use client";

import { useState, useTransition } from "react";
import ReactCountryFlag from "react-country-flag";
import { Globe, Users, Lock } from "lucide-react";
import { toggleLanguage } from "@/features/languages/server/actions";
import type { Language } from "@/features/languages/server/queries";

type Props = {
  languages: Language[];
  userCounts: Record<string, number>;
};

export function LanguagesClient({ languages: initial, userCounts }: Props) {
  const [languages, setLanguages] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalUsers = Object.values(userCounts).reduce((a, b) => a + b, 0);
  const activeCount = languages.filter((l) => l.is_active).length;

  function handleToggle(code: string, currentlyActive: boolean) {
    if (code === "en") return; // English is always on
    setErrorMsg(null);

    // Optimistic update
    setLanguages((prev) =>
      prev.map((l) => (l.code === code ? { ...l, is_active: !currentlyActive } : l))
    );

    startTransition(async () => {
      const result = await toggleLanguage(code, !currentlyActive);
      if (result.error) {
        // Revert on error
        setLanguages((prev) =>
          prev.map((l) => (l.code === code ? { ...l, is_active: currentlyActive } : l))
        );
        setErrorMsg(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#C6A85E]/10 border border-[#C6A85E]/20 flex items-center justify-center">
          <Globe className="h-5 w-5 text-[#C6A85E]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Language Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Control which languages are available to users. English is always the default.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Active languages" value={String(activeCount)} />
        <StatCard label="Total languages" value={String(languages.length)} />
        <StatCard label="Users with preference set" value={String(totalUsers)} />
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Languages table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Languages
          </h2>
        </div>

        <div className="divide-y divide-white/5">
          {languages.map((lang) => {
            const count = userCounts[lang.code] ?? 0;
            const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;

            return (
              <div
                key={lang.code}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                {/* Flag */}
                <ReactCountryFlag
                  countryCode={lang.country_code}
                  svg
                  style={{ width: 28, height: 28, borderRadius: 4, flexShrink: 0 }}
                />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{lang.name}</span>
                    <span className="text-xs text-gray-500">{lang.native_name}</span>
                    {lang.is_default && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#C6A85E]/10 border border-[#C6A85E]/20 px-2 py-0.5 text-[10px] font-medium text-[#C6A85E]">
                        <Lock className="h-2.5 w-2.5" />
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">
                    {lang.code}
                  </div>
                </div>

                {/* User count */}
                <div className="hidden sm:flex flex-col items-end gap-1 min-w-[80px]">
                  <div className="flex items-center gap-1.5 text-sm text-gray-300">
                    <Users className="h-3.5 w-3.5 text-gray-500" />
                    {count.toLocaleString()}
                  </div>
                  <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#C6A85E]/60 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-600">{pct}% of users</div>
                </div>

                {/* Status badge */}
                <div className="hidden md:block w-20 text-center">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      lang.is_active
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/5 text-gray-500 border border-white/10"
                    }`}
                  >
                    {lang.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Toggle */}
                <div className="flex items-center">
                  {lang.is_default ? (
                    <div
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#C6A85E]/40 cursor-not-allowed opacity-60"
                      title="English is always active as the default language"
                    >
                      <span className="translate-x-6 inline-block h-4 w-4 rounded-full bg-[#C6A85E] shadow transition-transform" />
                    </div>
                  ) : (
                    <button
                      role="switch"
                      aria-checked={lang.is_active}
                      disabled={pending}
                      onClick={() => handleToggle(lang.code, lang.is_active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A85E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F14] disabled:opacity-50 disabled:cursor-not-allowed ${
                        lang.is_active ? "bg-[#C6A85E]" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          lang.is_active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-gray-600">
        Changes take effect immediately for new visitors. Existing users with a preference for a
        deactivated language can still access that locale via direct URL.
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
