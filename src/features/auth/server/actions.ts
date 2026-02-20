'use server';

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { updatePasswordSchema, updateEmailSchema } from "@/features/auth/schema";
import { ActionState } from "@/features/types";

export async function updatePassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated', success: false };
    }

    const rawData = {
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
    };

    const validated = updatePasswordSchema.safeParse(rawData);

    if (!validated.success) {
        const errorMessage = validated.error.issues.map(e => e.message).join(', ');
        return { error: 'Invalid data: ' + errorMessage, success: false };
    }

    const { error } = await supabase.auth.updateUser({
        password: validated.data.password,
    });

    if (error) {
        return { error: 'Password update failed: ' + error.message, success: false };
    }

    return { success: true, message: 'Password updated successfully!' };
}

export async function updateEmail(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated', success: false };
    }

    const rawData = {
        email: formData.get('email'),
    };

    const validated = updateEmailSchema.safeParse(rawData);

    if (!validated.success) {
        const errorMessage = validated.error.issues.map(e => e.message).join(', ');
        return { error: 'Invalid data: ' + errorMessage, success: false };
    }

    // Use service role key for admin updates
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            }
        }
    );

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { email: validated.data.email, email_confirm: true }
    );

    if (error) {
        return { error: 'Email update failed: ' + error.message, success: false };
    }

    return { success: true, message: 'Email updated successfully!' };
}
