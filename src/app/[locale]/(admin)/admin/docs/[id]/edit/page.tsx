import { notFound } from "next/navigation";
import { getDocArticleById } from "@/features/docs/server/actions";
import { DocArticleForm } from "../../doc-article-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditDocArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getDocArticleById(id);
  if (!article) notFound();

  return <DocArticleForm article={article} />;
}
