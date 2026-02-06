'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { triggerOrderCreatedWebhook } from '@/services/webhookTriggerService';
import { CartItem } from '@/types';

interface CreateOrderParams {
    userId?: string;
    items: CartItem[];
    totalAmount: number;
    paymentId: string;
    status?: string;
    shippingAddress?: any; // Simplified for now
    userEmail: string;
    userPhone: string;
    channel?: string;
}

export async function createOrderAction(params: CreateOrderParams) {
    console.log("Creating Order for user:", params.userEmail);

    try {
        // 1. Create Order Record
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: params.userId || null, // Can be null for guest? Database might allow or we create a guest user.
                total_amount: params.totalAmount,
                status: params.status || 'Pending',
                payment_id: params.paymentId,
                shipping_address: params.shippingAddress, // JSONB
                user_email: params.userEmail, // Ensure DB has this column or we rely on user_id
                user_phone: params.userPhone, // Ensure DB has this column
                channel: params.channel || 'ecommerce',
                order_date: new Date().toISOString()
            })
            .select()
            .single();

        if (orderError) {
            console.error("Error creating order record:", orderError);
            // If user_email/phone columns missing, we might fail here if they are not in schema.
            // Assumption: DB schema matches. If not, we might need migration.
            // Based on previous reads, 'orders' table has 'user_phone'.
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
