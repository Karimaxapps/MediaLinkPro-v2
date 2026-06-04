"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ActionState } from "@/features/types";
import { getUserUsage } from "@/features/billing/server/usage";

export async function createDemoRequest(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    const productId = formData.get("product_id") as string;
    const organizationId = formData.get("organization_id") as string;
    const contactName = formData.get("contact_name") as string;
    const contactEmail = formData.get("contact_email") as string;
    const contactPhone = formData.get("contact_phone") as string;
    const companyName = formData.get("company_name") as string;
    const message = formData.get("message") as string;
    const requestTypeRaw = formData.get("request_type") as string | null;
    const requestType = requestTypeRaw === "quote" ? "quote" : "demo";

    if (!productId || !contactName || !contactEmail || !message) {
        return {
            success: false,
            message: "Missing required fields",
            error: "Please fill in all required fields."
        };
    }

    // Enforce the monthly demo/quote-request cap for logged-in users
    // (Free 10 / Verified Pro unlimited). Guests are not counted.
    if (user?.id) {
        const { demoRequestsThisMonth } = await getUserUsage(user.id);
        if (demoRequestsThisMonth.exhausted) {
            return {
                success: false,
                message: "Monthly limit reached",
                error: `You've reached your ${demoRequestsThisMonth.limit} demo/quote requests for this month. Upgrade to Verified Pro for unlimited requests.`,
            };
        }
    }

    try {
        const { error } = await supabase.rpc('create_demo_request_with_notification', {
            p_product_id: productId,
            p_organization_id: organizationId,
            p_requester_id: user?.id || null, // Allow null for guests if logic supports it, though usually we might want auth
            p_contact_name: contactName,
            p_contact_email: contactEmail,
            p_contact_phone: contactPhone,
            p_company_name: companyName,
            p_message: message,
            p_request_type: requestType
        });

        if (error) {
            console.error("Error creating demo request:", error);
            return {
                success: false,
                message: "Failed to submit request",
                error: error.message
            };
        }

        return {
            success: true,
            message: `${requestType === "quote" ? "Quote" : "Demo"} request sent successfully! The company will contact you soon.`
        };
    } catch (e) {
        console.error("Unexpected error:", e);
        return {
            success: false,
            message: "An unexpected error occurred",
            error: "Please try again later."
        };
    }
}

export async function getOrganizationRequests(organizationId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('demo_requests')
        .select(`
            *,
            products (name, slug)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching requests:", error);
        return [];
    }

    return data;
}

export async function updateRequestStatus(requestId: string, status: 'pending' | 'contacted' | 'ignored') {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Look up the request's owning organization so we can verify the caller
    // is an admin/owner. Without this check anyone with a valid request UUID
    // could flip status fields on requests addressed to other companies.
    const { data: request } = await supabase
        .from('demo_requests')
        .select('organization_id')
        .eq('id', requestId)
        .single();

    if (!request) return { success: false, error: 'Request not found' };

    const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', request.organization_id)
        .eq('user_id', user.id)
        .maybeSingle();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return { success: false, error: 'You do not have permission to update this request' };
    }

    const { error } = await supabase
        .from('demo_requests')
        .update({ status })
        .eq('id', requestId);

    if (error) {
        console.error("Error updating request status:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
