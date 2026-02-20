'use server';

import { pb } from '@/lib/pocketbase';
import { getPocketBaseAdmin } from "@/lib/pocketbaseAdmin";
import { triggerOrderCreatedWebhook } from '@/services/webhookTriggerService';
import { CartItem } from '@/types';

export interface CreateOrderParams {
    userId?: string;
    items: CartItem[];
    totalAmount: number;
    paymentId: string;
    status?: string;
    shippingAddress?: any;
    shippingFee?: number;
    userEmail: string;
    userPhone: string;
    channel?: string;
}

export async function createOrderAction(params: CreateOrderParams) {
    console.log("Creating Order for user:", params.userEmail);

    try {
        // 1. Create Order Record
        // In PB, we store items as JSON directly in 'items' field.
        // We link user via 'user' relation (requires userId to be a valid PB user ID).
        // If guest (no userId), 'user' relation might be empty or we need a guest user logic.
        // For now, if userId is present, we use it. If not, we leave it empty (if allowed by schema, which it is based on my update).

        const pbAdmin = await getPocketBaseAdmin();
        const payload = {
            user: params.userId || "", // Empty string if guest? Or null? PB relation expects ID or null.
            total: params.totalAmount,
            shipping_cost: params.shippingFee || 0,
            status: params.status || 'pending', // Lowercase match schema options
            payment_id: params.paymentId,
            payment_method: 'credit_card', // Default or passed param?
            shipping_address: params.shippingAddress,
            items: params.items, // JSON field
            // user_email: params.userEmail, // Not in schema, relying on user relation or shipping_address
            // user_phone: params.userPhone
        };

        const record = await pbAdmin.collection('orders').create(payload);

        // 2. Trigger Webhook
        // Construct full order matching Order interface
        const fullOrder = {
            id: record.id,
            userId: params.userId || 'guest',
            items: params.items,
            totalAmount: params.totalAmount, // Map explicitly
            orderDate: record.created, // PB created timestamp
            status: (params.status || 'Pending') as any, // Cast to match type
            shippingAddress: typeof params.shippingAddress === 'string' ? params.shippingAddress : JSON.stringify(params.shippingAddress),
            channel: params.channel,
            userPhone: params.userPhone
        };

        try {
            await triggerOrderCreatedWebhook(fullOrder);
        } catch (whError) {
            console.error("Webhook trigger failed (non-blocking):", whError);
        }

        return { success: true, orderId: record.id };

    } catch (error: any) {
        console.error("Create Order Exception:", error);
        return { success: false, message: error.message };
    }
}

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
    try {
        console.log(`Updating Order ${orderId} to ${newStatus}`);

        const pbAdmin = await getPocketBaseAdmin();
        await pbAdmin.collection('orders').update(orderId, {
            status: newStatus
        });

        // 2. Trigger Webhook
        try {
            const { triggerOrderStatusUpdateWebhook } = await import('@/services/webhookTriggerService');
            await triggerOrderStatusUpdateWebhook(orderId, newStatus);
        } catch (whError) {
            console.error("Webhook trigger failed:", whError);
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
