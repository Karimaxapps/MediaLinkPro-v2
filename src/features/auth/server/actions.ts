'use server';

import { createClient } from "@/lib/supabase/server";
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
        newEmail: formData.get('newEmail'),
    };

    const validated = updateEmailSchema.safeParse(rawData);

    if (!validated.success) {
        const errorMessage = validated.error.issues.map(e => e.message).join(', ');
        return { error: 'Invalid data: ' + errorMessage, success: false };
    }

    if (validated.data.newEmail.toLowerCase() === (user.email ?? '').toLowerCase()) {
        return { error: 'The new email matches your current email.', success: false };
    }

    // Trigger a confirmation email to the new address. Supabase keeps the old
    // email active until the user clicks the verification link, so this does
    // NOT change the email immediately — it sends the confirmation flow.
    const { error } = await supabase.auth.updateUser({
        email: validated.data.newEmail,
    });

    if (error) {
        return { error: 'Email update failed: ' + error.message, success: false };
    }

    // Sign the user out so they re-authenticate after confirming the change.
    await supabase.auth.signOut();

    return {
        success: true,
        message: 'Confirmation email sent. Please verify your new address, then log in again.',
    };
}
