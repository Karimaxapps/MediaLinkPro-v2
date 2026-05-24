import { PenSquare } from "lucide-react";
import { listAdminBlogPosts } from "@/features/admin/server/actions";
import { BlogClient } from "./blog-client";

export const metadata = { title: "Blog Posts — Admin" };

export default async function AdminBlogPage() {
  const posts = await listAdminBlogPosts(200);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PenSquare className="h-6 w-6 text-[var(--brand)]" />
            Blog Posts
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage all posts across every organization. Change status or remove content.
          </p>
        </div>
      </div>

      <BlogClient posts={posts} />
    </div>
  );
}
