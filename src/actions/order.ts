'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
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
        // NOTE: Uses ADMIN client to bypass RLS issues during checkout
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: params.userId || null,
                total_amount: params.totalAmount,
                shipping_fee: params.shippingFee || 0,
                status: params.status || 'Pending',
                payment_id: params.paymentId,
                shipping_address: params.shippingAddress, // JSONB
                user_email: params.userEmail,
                user_phone: params.userPhone,
                channel: params.channel || 'ecommerce',
                order_date: new Date().toISOString()
            })
            .select()
            .single();

        if (orderError) {
            console.error("Error creating order record:", orderError);
            throw new Error(`Falha ao criar pedido: ${orderError.message}`);
        }

        // 2. Create Order Items
        const orderItemsCtx = params.items.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
        }));

        const { error: itemsError } = await supabaseAdmin
            .from('order_items')
            .insert(orderItemsCtx);

        if (itemsError) {
            console.error("Error creating order items:", itemsError);
            throw new Error(`Falha ao salvar itens do pedido: ${itemsError.message}`);
        }

        // 3. Trigger Webhook
        // We construct a full order object for the webhook
        const fullOrder = {
            ...order,
            items: params.items, // Use the input items as they have names etc.
            userId: params.userId || 'guest',
            userPhone: params.userPhone
        };

        // Fire and forget (or await if critical)
        try {
            await triggerOrderCreatedWebhook(fullOrder);
        } catch (whError) {
            console.error("Webhook trigger failed (non-blocking):", whError);
        }

        // 4. Return Success
        return { success: true, orderId: order.id };

    } catch (error: any) {
        console.error("Create Order Exception:", error);
        return { success: false, message: error.message };
    }
}

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
    try {
        console.log(`Updating Order ${orderId} to ${newStatus}`);

        // 1. Update Status in DB
        // Using ADMIN client to bypass RLS
        const { error } = await supabaseAdmin
            .from('orders')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) {
            console.error("Update Status Error:", error);
            return { success: false, message: error.message };
        }

        // 2. Trigger Webhook
        // We need to dynamically import or call the service
        // Since this file is server-side, we can import directly? 
        // Circular dependency check: order.ts imports webhookService. webhookService imports types. types imported by order.ts.
        // Seems cyclic if webhookService imports order.ts, but it doesn't.

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
