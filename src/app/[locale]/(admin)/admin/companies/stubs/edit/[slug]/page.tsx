import { notFound } from "next/navigation";
import { getAdminStubBySlug } from "@/features/organizations/server/stub-actions";
import { StubEditClient } from "./edit-client";

type Props = { params: Promise<{ slug: string }> };

export default async function StubEditPage({ params }: Props) {
  const { slug } = await params;
  const org = await getAdminStubBySlug(slug);
  if (!org) notFound();
  return <StubEditClient org={org} />;
}
