import Link from "next/link";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateGate } from "@/components/subscription/create-gate";
import { createAdminClient } from "@/lib/supabase/server";
import type { Quota } from "@/features/billing/server/usage";

type Props = {
  orgId: string;
  blogQuota?: Quota;
};

type RecentPost = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  created_at: string;
};

export async function CompanyBlogWidget({ orgId, blogQuota }: Props) {
  const admin = createAdminClient();

  const { data, count } = await admin
    .from("blog_posts" as never)
    .select("id, title, slug, status, created_at", { count: "exact" })
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(4);

  const posts = (data ?? []) as unknown as RecentPost[];
  const total = count ?? posts.length;
  const published = posts.filter((p) => p.status === "published").length;

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--brand)]" />
            Blog Posts
          </CardTitle>
          <p className="text-xs text-gray-400 mt-1">
            {total} total · {published} published
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/blog">
            <Button
              variant="outline"
              className="bg-transparent border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/10 text-xs"
            >
              View all
            </Button>
          </Link>
          <CreateGate
            noun="blog post"
            nounPlural="blog posts"
            href="/blog/new"
            label="Write a post"
            hasOrg={true}
            quota={blogQuota}
          />
        </div>
      </CardHeader>

      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            No posts yet. Share your expertise with the community.
          </p>
        ) : (
          <div className="space-y-2">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/feed/${p.slug}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">{p.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(p.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <span
                  className={
                    "shrink-0 text-xs px-2 py-0.5 rounded-full border " +
                    (p.status === "published"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : p.status === "draft"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : "bg-gray-500/10 text-gray-400 border-gray-500/20")
                  }
                >
                  {p.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
