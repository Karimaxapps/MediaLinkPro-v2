import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { QrCode, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductScannersResult } from "@/features/products/server/analytics-actions";

function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProductScannersList({ data }: { data: ProductScannersResult }) {
  const { scans, uniqueUsers, anonymousCount } = data;

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-[var(--brand)]" />
          Who Scanned This Product
        </CardTitle>
        <CardDescription className="text-gray-400">
          {uniqueUsers} signed-in {uniqueUsers === 1 ? "user" : "users"}
          {anonymousCount > 0 ? ` · ${anonymousCount} anonymous` : ""} · most recent first
        </CardDescription>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <div className="h-[120px] flex items-center justify-center border border-dashed border-white/10 rounded bg-black/20">
            <span className="text-gray-500 text-sm">No scans yet</span>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {scans.map((scan) => {
              const p = scan.profile;
              const when = formatDistanceToNow(new Date(scan.scannedAt), {
                addSuffix: true,
              });
              const subtitle = [p?.jobTitle, p?.company].filter(Boolean).join(" · ");

              const row = (
                <div className="flex items-center gap-3 py-3">
                  <Avatar>
                    {p?.avatarUrl ? <AvatarImage src={p.avatarUrl} alt={p.fullName ?? ""} /> : null}
                    <AvatarFallback className="bg-white/10 text-gray-300">
                      {p ? initials(p.fullName ?? p.username) : <UserRound className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {p ? p.fullName || p.username || "MediaLinkPro user" : "Anonymous visitor"}
                    </p>
                    {subtitle ? (
                      <p className="truncate text-xs text-gray-400">{subtitle}</p>
                    ) : !p ? (
                      <p className="truncate text-xs text-gray-500">Not signed in when scanning</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">{when}</span>
                </div>
              );

              // Link identified users to their public profile.
              return (
                <li key={scan.scanId}>
                  {p?.username ? (
                    <Link
                      href={`/profiles/${p.username}`}
                      className="block rounded-lg px-2 -mx-2 hover:bg-white/5 transition-colors"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className="px-2 -mx-2">{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
