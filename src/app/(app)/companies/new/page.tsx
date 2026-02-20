import { Metadata } from "next";
import { CompanyWizard } from "@/features/organizations/components/company-wizard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata: Metadata = {
    title: "Create Company | MediaLinkPro",
    description: "Create your company profile on MediaLinkPro",
};

export default async function CreateCompanyPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    return (
        <div className="container max-w-4xl py-10">
            <div className="mb-8 text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Create Company Profile</h1>
                <p className="text-muted-foreground text-gray-400">
                    Set up your organization's presence. You can update this information later.
                </p>
            </div>

            <CompanyWizard userId={user.id} />
        </div>
    );
}
