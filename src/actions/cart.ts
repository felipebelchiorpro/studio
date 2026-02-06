'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function syncCartAction(cartId: string, items: any[], total: number, email?: string, phone?: string) {
    try {
        const payload: any = {
            id: cartId,
            items,
            total,
            updated_at: new Date().toISOString()
        };

        if (email) payload.user_email = email;
        if (phone) payload.user_phone = phone;

        // Upsert the cart
        const { error } = await supabaseAdmin
            .from('carts')
            .upsert(payload, { onConflict: 'id' });

        if (error) {
            console.error("Sync Cart Error:", error.message);
            return { success: false, message: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Sync Cart Exception:", error.message);
        return { success: false, message: error.message };
    }
}
