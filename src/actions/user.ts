'use server';

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function updateUserAddressAction(userId: string, address: any) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { user_metadata: { address: address } }
    );

    if (error) {
        console.error("Error updating user address:", error);
        return { success: false, message: error.message };
    }

    return { success: true };
}
