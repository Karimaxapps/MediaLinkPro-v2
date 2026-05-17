import { requireSiteAdmin } from "@/features/admin/server/actions";
import { StubNewClient } from "./stub-new-client";

export const metadata = { title: "New Stub Company — Admin" };

export default async function NewStubCompanyPage() {
  const { userId } = await requireSiteAdmin();
  return <StubNewClient userId={userId} />;
}
