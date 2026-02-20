'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { insertProductSchema } from "../schema";
import { ActionState } from "@/features/types";
import { redirect } from "next/navigation";
import { Product } from "../types";

export async function createProduct(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated', success: false };
    }

    // ... existing Create Product logic ...
    const rawData = {
        organization_id: formData.get('organization_id'),
        name: formData.get('name'),
        slug: formData.get('slug'),
        description: formData.get('description'),
        logo_url: formData.get('logo_url') || undefined,
        is_public: formData.get('is_public') === 'on' || formData.get('is_public') === 'true',
        product_type: formData.get('product_type'),
        main_category: formData.get('main_category'),
        sub_category: formData.get('sub_category') || undefined,
        short_description: formData.get('short_description'),
        external_url: formData.get('external_url') || undefined,
        documentation_url: formData.get('documentation_url') || undefined,
        certification_url: formData.get('certification_url') || undefined,
        gallery_urls: formData.getAll('gallery_urls') as string[],
        promo_video_url: formData.get('promo_video_url') || undefined,
        // New fields
        support_url: formData.get('support_url') || undefined,
        course_url: formData.get('course_url') || undefined,
        training_video_urls: formData.getAll('training_video_urls') as string[],
        availability_status: formData.get('availability_status') || undefined,
        price: formData.get('price') ? Number(formData.get('price')) : undefined,
        currency: formData.get('currency') || 'USD',
        price_upon_request: formData.get('price_upon_request') === 'on' || formData.get('price_upon_request') === 'true',
        pricing_model: formData.get('pricing_model') || undefined,
        status: formData.get('status') || 'draft',
        views: 0,
    };

    const validated = insertProductSchema.safeParse(rawData);
    if (!validated.success) {
        console.error("Validation Error:", JSON.stringify(validated.error, null, 2));
        // Safe access to ZodError messages
        const errorMessage = validated.error.issues
            ? validated.error.issues.map(e => e.message).join(', ')
            : validated.error.message; // Fallback

        return { error: 'Invalid data: ' + errorMessage, success: false };
    }

    // Verify user has edit rights to org
    const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', validated.data.organization_id)
        .eq('user_id', user.id)
        .single();

    if (memberError || !['owner', 'admin', 'editor'].includes(membership?.role || '')) {
        return { error: 'You do not have permission to create products for this organization.', success: false };
    }

    const { data: product, error: insertError } = await supabase
        .from('products')
        .insert(validated.data)
        .select()
        .single();

    if (insertError) {
        return { error: "Product creation failed: " + insertError.message, success: false };
    }

    return { success: true, message: 'Product created successfully!', data: product };
}

export async function updateProduct(productId: string, formData: FormData): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated', success: false };
    }

    // 1. Fetch existing product to check ownership/permissions
    const { data: existingProduct, error: fetchError } = await supabase
        .from('products')
        .select('organization_id')
        .eq('id', productId)
        .single();

    if (fetchError || !existingProduct) {
        return { error: 'Product not found', success: false };
    }

    // 2. Verify permissions
    const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', existingProduct.organization_id)
        .eq('user_id', user.id)
        .single();

    if (memberError || !['owner', 'admin', 'editor'].includes(membership?.role || '')) {
        return { error: 'You do not have permission to update this product.', success: false };
    }

    // 3. Prepare update data
    // We only update fields that are present in the form data to allow partial updates
    const updates: any = {};
    const fields = [
        'name', 'slug', 'description', 'logo_url', 'is_public', 'product_type',
        'main_category', 'sub_category', 'short_description', 'external_url',
        'documentation_url', 'certification_url', 'promo_video_url',
        'support_url', 'course_url', 'availability_status', 'price',
        'currency', 'price_upon_request', 'pricing_model', 'status'
    ];

    fields.forEach(field => {
        if (formData.has(field)) {
            if (field === 'is_public' || field === 'price_upon_request') {
                updates[field] = formData.get(field) === 'on' || formData.get(field) === 'true';
            } else if (field === 'price') {
                const val = formData.get(field);
                updates[field] = val ? Number(val) : null;
            } else {
                updates[field] = formData.get(field);
            }
        }
    });

    // Handle arrays separately
    if (formData.has('gallery_urls')) {
        updates.gallery_urls = formData.getAll('gallery_urls');
    }
    if (formData.has('training_video_urls')) {
        updates.training_video_urls = formData.getAll('training_video_urls');
    }

    // 4. Perform Update
    const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

    if (updateError) {
        return { error: "Product update failed: " + updateError.message, success: false };
    }

    return { success: true, message: 'Product updated successfully!', data: updatedProduct };
}

export async function getProductsByOrg(orgId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    return data;
}

export async function getProductBySlug(slug: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            organizations (
                id,
                name,
                slug,
                logo_url
            )
        `)
        .eq('slug', slug)
        .single();

    if (error) {
        console.error("Error fetching product:", error);
        return null;
    }

    return data;
}

export async function getProductById(id: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            organizations (
                id,
                name,
                slug,
                logo_url
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching product by ID:", error);
        return null;
    }

    return data;
}

export async function getProductResources(productId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
        .from('product_community_resources')
        .select(`
            *,
            profiles:created_by!left (
                full_name,
                avatar_url
            )
        `)
        .eq('product_id', productId)
        .order('upvotes_count', { ascending: false })
        .order('created_at', { ascending: false });

    const { data: resources, error } = await query;

    if (error) {
        console.error("Error fetching product resources:", error);
        return [];
    }

    // specific upvote status for current user
    if (user && resources) {
        const { data: upvotes } = await supabase
            .from('product_resource_upvotes')
            .select('resource_id')
            .eq('user_id', user.id)
            .in('resource_id', resources.map(r => r.id));

        const upvotedIds = new Set(upvotes?.map(u => u.resource_id));
        return resources.map(r => ({
            ...r,
            is_upvoted: upvotedIds.has(r.id)
        }));
    }

    return resources.map(r => ({
        ...r,
        is_upvoted: false
    }));
}

export async function addCommunityResource(productId: string, url: string): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    // Auto-approve if YouTube, otherwise wait for approval (or just auto-approve everything for now as per plan)
    // As per user request: "in the community ressources tab allow global user to add/delete yoube video links"
    // I will auto-approve everything for now to keep it simple, or check if it is a video type.
    // The user said "Video, title, upvote (to list the video on top), a separator line"
    // So I assume we are adding videos.

    // Basic YouTube URL validation/extraction could go here, but for now I'll trust the input or client-side validation
    // Ideally we fetch the title from YouTube, but I'll ask for title in the UI or fetch it here.
    // Use oembed or similar if possible, but that might be overengineering.
    // For now, I'll require a title from the client or just use the URL as title?
    // The previous implementation of `addProductResource` took a title.
    // The user prompt said: "Video, title, upvote..."
    // So I need a title. I'll update the signature to accept title.

    return { error: 'Please use addCommunityVideo instead', success: false };
}

export async function addCommunityVideo(productId: string, title: string, url: string): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    // Basic validation
    if (!url || !title) return { error: 'Title and URL are required', success: false };

    const { error } = await supabase
        .from('product_community_resources')
        .insert({
            product_id: productId,
            title,
            url,
            type: 'video', // defaulting to video as per request
            created_by: user.id,
            is_approved: true, // Auto-approve
            upvotes_count: 0
        });

    if (error) {
        return { error: 'Failed to add video: ' + error.message, success: false };
    }

    return { success: true, message: 'Video added successfully!' };
}

export async function deleteCommunityResource(resourceId: string): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    // Fetch resource to check ownership
    const { data: resource } = await supabase
        .from('product_community_resources')
        .select('created_by, product_id')
        .eq('id', resourceId)
        .single();

    if (!resource) return { error: 'Resource not found', success: false };

    // Allow if creator
    if (resource.created_by === user.id) {
        const { error } = await supabase
            .from('product_community_resources')
            .delete()
            .eq('id', resourceId);

        if (error) return { error: 'Failed to delete: ' + error.message, success: false };
        return { success: true, message: 'Resource deleted' };
    }

    // Allow if product owner/admin
    const { data: product } = await supabase
        .from('products')
        .select('organization_id')
        .eq('id', resource.product_id)
        .single();

    if (product) {
        const { data: membership } = await supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', product.organization_id)
            .eq('user_id', user.id)
            .single();

        if (membership && ['owner', 'admin', 'editor'].includes(membership.role)) {
            const { error } = await supabase
                .from('product_community_resources')
                .delete()
                .eq('id', resourceId);

            if (error) return { error: 'Failed to delete: ' + error.message, success: false };
            return { success: true, message: 'Resource deleted' };
        }
    }

    return { error: 'You do not have permission to delete this resource', success: false };
}

export async function toggleResourceUpvote(resourceId: string): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    // Check if already upvoted
    const { data: existingUpvote } = await supabase
        .from('product_resource_upvotes')
        .select('id')
        .eq('user_id', user.id)
        .eq('resource_id', resourceId)
        .single();

    if (existingUpvote) {
        // Remove upvote
        const { error: deleteError } = await supabase
            .from('product_resource_upvotes')
            .delete()
            .eq('id', existingUpvote.id);

        if (deleteError) return { error: 'Failed to remove upvote', success: false };

        // Decrement count using RPC
        await supabase.rpc('decrement_resource_upvote', { resource_id: resourceId });

        return { success: true, message: 'Upvote removed' };
    } else {
        // Add upvote
        const { error: insertError } = await supabase
            .from('product_resource_upvotes')
            .insert({
                user_id: user.id,
                resource_id: resourceId
            });

        if (insertError) return { error: 'Failed to upvote', success: false };

        // Increment count using RPC
        await supabase.rpc('increment_resource_upvote', { resource_id: resourceId });

        return { success: true, message: 'Upvoted' };
    }

}

export async function getProductExperts(productId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('product_experts')
        .select(`
            *,
            profiles:user_id (
                id,
                full_name,
                avatar_url,
                headline
            )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching product experts:", error);
        return [];
    }

    console.log("Fetched experts data:", JSON.stringify(data, null, 2));

    // Flatten the structure for easier consumption
    return data.map(item => ({
        ...item,
        profile: item.profiles
    }));
}

export async function joinProductExperts(productId: string, expertiseLevel: string): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated', success: false };
    }

    const { error } = await supabase
        .from('product_experts')
        .insert({
            product_id: productId,
            user_id: user.id,
            expertise_level: expertiseLevel,
            is_verified: true,
            verification_status: 'verified'
        });

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { error: 'You are already registered as a user/expert for this product.', success: false };
        }
        return { error: "Failed to join: " + error.message, success: false };
    }

    return { success: true, message: 'Successfully registered as a product user/expert!' };
}

export async function removeProductExpert(productId: string, userId: string): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated', success: false };
    }

    // Check if current user is owner/admin of the product's organization
    // or if the user is removing themselves (already handled by RLS, but good to check)
    // For owner removal of others:
    if (user.id !== userId) {
        const { data: product } = await supabase
            .from('products')
            .select('organization_id')
            .eq('id', productId)
            .single();

        if (product) {
            const { data: membership } = await supabase
                .from('organization_members')
                .select('role')
                .eq('organization_id', product.organization_id)
                .eq('user_id', user.id)
                .single();

            if (!['owner', 'admin'].includes(membership?.role || '')) {
                return { error: "You do not have permission to remove this user.", success: false };
            }
        }
    }

    const { error } = await supabase
        .from('product_experts')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', userId);

    if (error) {
        return { error: "Failed to remove user: " + error.message, success: false };
    }

    return { success: true, message: 'Successfully removed from product users list.' };
}

export async function incrementProductView(productId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    // Get or create visitor ID for anonymous tracking
    let visitorId = cookieStore.get('visitor_id')?.value;
    if (!visitorId) {
        visitorId = crypto.randomUUID();
        // Set visitor_id cookie for 1 year
        cookieStore.set('visitor_id', visitorId, {
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
    }

    if (user) {
        // Check if user is owner/admin of the organization
        const { data: product } = await supabase
            .from('products')
            .select('organization_id')
            .eq('id', productId)
            .single();

        if (product) {
            const { data: membership } = await supabase
                .from('organization_members')
                .select('role')
                .eq('organization_id', product.organization_id)
                .eq('user_id', user.id)
                .single();

            if (membership && ['owner', 'admin'].includes(membership.role)) {
                return; // Do not increment view count for owners/admins
            }
        }
    }

    // Insert unique view record
    // The trigger will handle views_count increment on products table
    const { error } = await supabase
        .from('product_views')
        .insert({
            product_id: productId,
            user_id: user?.id || null,
            visitor_id: user ? null : visitorId // Prefer user_id if logged in
        });

    // If error is 23505 (unique violation), it means they already viewed it, which is fine
    if (error && error.code !== '23505') {
        console.error("Error tracking product view:", error);
    }

    // Return updated count
    const { data } = await supabase
        .from('products')
        .select('views_count')
        .eq('id', productId)
        .single();

    return data?.views_count || 0;
}

export async function incrementProductQRScan(productId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.rpc('increment_product_qr_scans', { product_id: productId });

    if (error) {
        console.error("Error incrementing product QR scan:", error);
        return 0;
    }

    // Return updated count
    const { data } = await supabase
        .from('products')
        .select('qr_scans_count')
        .eq('id', productId)
        .single();

    return data?.qr_scans_count || 0;
}

export async function toggleBookmark(productId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check if bookmark exists
    const { data: existingBookmark } = await supabase
        .from('product_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

    let isBookmarked = false;

    if (existingBookmark) {
        // Remove bookmark
        const { error } = await supabase
            .from('product_bookmarks')
            .delete()
            .eq('id', existingBookmark.id);

        if (error) throw new Error(error.message);
        isBookmarked = false;
    } else {
        // Add bookmark
        const { error } = await supabase
            .from('product_bookmarks')
            .insert({ user_id: user.id, product_id: productId });

        if (error) throw new Error(error.message);
        isBookmarked = true;
    }

    // Get updated count
    const { count } = await supabase
        .from('product_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

    return { bookmarked: isBookmarked, count: count || 0 };
}

export async function getBookmarkStatus(productId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    // Always fetch count
    const { count } = await supabase
        .from('product_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

    if (!user) return { bookmarked: false, count: count || 0 };

    const { data } = await supabase
        .from('product_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

    return { bookmarked: !!data, count: count || 0 };
}

export async function getBookmarkedProducts() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('product_bookmarks')
        .select(`
            product_id,
            products (
                *,
                organizations (
                    id,
                    name,
                    slug,
                    logo_url
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching bookmarked products:", error);
        return [];
    }

    // Flatten the result to return product objects
    // Supabase might return products as an array if relationship isn't explicitly 1:1
    return data.map(bookmark => {
        const prod = bookmark.products;
        return Array.isArray(prod) ? prod[0] : prod;
    }).filter(Boolean) as Product[];
}

export async function getPublicProducts() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            organizations (
                id,
                name,
                slug,
                logo_url
            )
        `)
        .eq('status', 'published')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching public products:", error);
        return [];
    }

    return data;
}

export async function deleteProduct(productId: string): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated', success: false };
    }

    // 1. Fetch existing product to check ownership/permissions
    const { data: existingProduct, error: fetchError } = await supabase
        .from('products')
        .select('organization_id')
        .eq('id', productId)
        .single();

    if (fetchError || !existingProduct) {
        return { error: 'Product not found', success: false };
    }

    // 2. Verify permissions
    const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', existingProduct.organization_id)
        .eq('user_id', user.id)
        .single();

    if (memberError || !['owner', 'admin'].includes(membership?.role || '')) {
        return { error: 'You do not have permission to delete this product.', success: false };
    }

    // 3. Perform Delete
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (deleteError) {
        return { error: "Product deletion failed: " + deleteError.message, success: false };
    }

    return { success: true, message: 'Product deleted successfully!' };
}

export async function getProductDemoRequestsCount(productId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // 1. Verify ownership/admin status
    const { data: product } = await supabase
        .from('products')
        .select('organization_id')
        .eq('id', productId)
        .single();

    if (!product) return 0;

    const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', product.organization_id)
        .eq('user_id', user.id)
        .single();

    if (!membership || !['owner', 'admin', 'editor'].includes(membership.role)) {
        return 0;
    }

    // 2. Get count of pending requests
    const { count } = await supabase
        .from('demo_requests')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)
        .eq('status', 'pending');

    return count || 0;
}

export async function addProductResource(data: {
    product_id: string;
    title: string;
    url: string;
    type: "official_link" | "shopping" | "training" | "youtube" | "documentation" | "certification";
}): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    // Verify ownership
    const { data: product } = await supabase
        .from('products')
        .select('organization_id')
        .eq('id', data.product_id)
        .single();

    if (!product) return { error: 'Product not found', success: false };

    const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', product.organization_id)
        .eq('user_id', user.id)
        .single();

    if (!membership || !['owner', 'admin', 'editor'].includes(membership.role)) {
        return { error: "You do not have permission to add resources.", success: false };
    }

    // Prepare insert data
    const resourceData: any = {
        product_id: data.product_id,
        title: data.title,
        url: data.url,
        type: data.type,
        added_by: user.id
    };

    const { error } = await supabase
        .from('product_resources')
        .insert(resourceData);

    if (error) {
        return { error: "Failed to add resource: " + error.message, success: false };
    }

    return { success: true, message: 'Resource added successfully!' };
}

export async function getProductOfficialResources(productId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('product_resources')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching official resources:", error);
        return [];
    }

    return data;
}

export async function updateProductResource(resourceId: string, data: {
    title?: string;
    url?: string;
    type?: "official_link" | "shopping" | "training" | "youtube" | "documentation" | "certification";
}): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    // Fetch resource to get product_id
    const { data: resource } = await supabase
        .from('product_resources')
        .select('product_id')
        .eq('id', resourceId)
        .single();

    if (!resource) return { error: 'Resource not found', success: false };

    // Verify ownership via product
    const { data: product } = await supabase
        .from('products')
        .select('organization_id')
        .eq('id', resource.product_id)
        .single();

    if (!product) return { error: 'Product not found', success: false };

    const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', product.organization_id)
        .eq('user_id', user.id)
        .single();

    if (!membership || !['owner', 'admin', 'editor'].includes(membership.role)) {
        return { error: "You do not have permission to update resources.", success: false };
    }

    const { error } = await supabase
        .from('product_resources')
        .update(data)
        .eq('id', resourceId);

    if (error) {
        return { error: "Failed to update resource: " + error.message, success: false };
    }

    return { success: true, message: 'Resource updated successfully!' };
}

export async function deleteProductResource(resourceId: string): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    // Fetch resource to get product_id
    const { data: resource } = await supabase
        .from('product_resources')
        .select('product_id')
        .eq('id', resourceId)
        .single();

    if (!resource) return { error: 'Resource not found', success: false };

    // Verify ownership via product
    const { data: product } = await supabase
        .from('products')
        .select('organization_id')
        .eq('id', resource.product_id)
        .single();

    if (!product) return { error: 'Product not found', success: false };

    const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', product.organization_id)
        .eq('user_id', user.id)
        .single();

    if (!membership || !['owner', 'admin', 'editor'].includes(membership.role)) {
        return { error: "You do not have permission to delete resources.", success: false };
    }

    const { error } = await supabase
        .from('product_resources')
        .delete()
        .eq('id', resourceId);

    if (error) {
        return { error: "Failed to delete resource: " + error.message, success: false };
    }

    return { success: true, message: 'Resource deleted successfully!' };
}

export async function removeProductTrainingVideo(productId: string, videoUrl: string): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    // 1. Fetch existing product
    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('organization_id, training_video_urls')
        .eq('id', productId)
        .single();

    if (fetchError || !product) {
        return { error: 'Product not found', success: false };
    }

    // 2. Verify permissions
    const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', product.organization_id)
        .eq('user_id', user.id)
        .single();

    if (memberError || !['owner', 'admin', 'editor'].includes(membership?.role || '')) {
        return { error: 'You do not have permission to update this product.', success: false };
    }

    // 3. Remove the video URL
    const updatedUrls = (product.training_video_urls || []).filter((url: string) => url !== videoUrl);

    if (updatedUrls.length === (product.training_video_urls || []).length) {
        // URL not found, nothing to update, but treat as success
        return { success: true, message: 'Video removed.' };
    }

    // 4. Update the product
    const { error: updateError } = await supabase
        .from('products')
        .update({ training_video_urls: updatedUrls })
        .eq('id', productId);

    if (updateError) {
        return { error: "Failed to remove video: " + updateError.message, success: false };
    }

    return { success: true, message: 'Video removed successfully!' };
}

export async function getLatestProducts(limit: number = 5) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            organizations (
                id,
                name,
                slug,
                logo_url
            )
        `)
        .eq('status', 'published')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching latest products:", error);
        return [];
    }

    return data;
}

export async function getProductDemoRequests(productId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Verify ownership/admin status
    const { data: product } = await supabase
        .from('products')
        .select('organization_id')
        .eq('id', productId)
        .single();

    if (!product) return [];

    const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', product.organization_id)
        .eq('user_id', user.id)
        .single();

    if (!membership || !['owner', 'admin', 'editor'].includes(membership.role)) {
        return [];
    }

    // 2. Get requests
    const { data, error } = await supabase
        .from('demo_requests')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching demo requests:", error);
        return [];
    }

    return data;
}

export async function getProductBookmarks(productId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Check permissions
    const { data: product } = await supabase
        .from('products')
        .select('organization_id')
        .eq('id', productId)
        .single();

    if (!product) return [];

    const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', product.organization_id)
        .eq('user_id', user.id)
        .single();

    if (!membership || !['owner', 'admin', 'editor'].includes(membership.role)) {
        return [];
    }

    const { data: bookmarks, error } = await supabase
        .from('product_bookmarks')
        .select('id, user_id, created_at')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching bookmarks:", error);
        return [];
    }

    // Enrich with profile data
    if (bookmarks.length > 0) {
        const userIds = bookmarks.map(b => b.user_id);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, email, username')
            .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        return bookmarks.map(b => ({
            ...b,
            user: profileMap.get(b.user_id) || null
        }));
    }

    return bookmarks;
}

export async function getProductScans(productId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Check permissions
    const { data: product } = await supabase
        .from('products')
        .select('organization_id')
        .eq('id', productId)
        .single();

    if (!product) return [];

    const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', product.organization_id)
        .eq('user_id', user.id)
        .single();

    if (!membership || !['owner', 'admin', 'editor'].includes(membership.role)) {
        return [];
    }

    const { data: scans, error } = await supabase
        .from('product_scans')
        .select('*')
        .eq('product_id', productId)
        .order('scanned_at', { ascending: false });

    if (error) {
        console.error("Error fetching scans:", error);
        return [];
    }

    // Enrich with profile data for known users
    const scannerIds = scans
        .filter(s => s.scanner_id)
        .map(s => s.scanner_id);

    if (scannerIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, email, username')
            .in('id', scannerIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        return scans.map(s => ({
            ...s,
            scanner: s.scanner_id ? profileMap.get(s.scanner_id) : null
        }));
    }

    return scans;
}
