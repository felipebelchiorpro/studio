'use server';

import { pb } from '@/lib/pocketbase';

export async function syncCartAction(cartId: string, items: any[], total: number, email?: string, phone?: string) {
    try {
        // cartId is the UUID from client (session_id)

        const payload: any = {
            session_id: cartId,
            items,
            total,
            user_email: email,
            user_phone: phone
        };

        // Try to find existing cart by session_id
        try {
            const record = await pb.collection('carts').getFirstListItem(`session_id="${cartId}"`);
            // Update
            await pb.collection('carts').update(record.id, payload);
        } catch (e: any) {
            if (e.status === 404) {
                // Create
                await pb.collection('carts').create(payload);
            } else {
                throw e;
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error("Sync Cart Exception:", error.message);
        return { success: false, message: error.message };
    }
}
