
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!productId) {
        // Just return user info and table info check
        const { error: tableError } = await supabase.from('product_experts').select('count', { count: 'exact', head: true });
        return NextResponse.json({
            message: "Provide ?productId=... to test insert",
            user: user.id,
            tableAccessible: !tableError,
            tableError: tableError
        });
    }

    // Try to insert
    const { data, error } = await supabase
        .from('product_experts')
        .insert({
            product_id: productId,
            user_id: user.id,
            expertise_level: "Intermediate",
            is_verified: true
        })
        .select();

    return NextResponse.json({
        attempted_insert: true,
        success: !error,
        error: error,
        data: data
    });
}
