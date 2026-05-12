import { Building2 } from "lucide-react";
import { listAdminOrganizations } from "@/features/admin/server/actions";
import { AdminCompaniesClient } from "./companies-client";

export const metadata = { title: "Companies — Admin" };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminCompaniesPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const companies = await listAdminOrganizations(q ?? "");
  return <AdminCompaniesClient companies={companies} initialQuery={q ?? ""} />;
}
