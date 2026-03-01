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
    userName?: string;
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
        const enrichedShippingAddress = {
            ...(typeof params.shippingAddress === 'object' ? params.shippingAddress : {}),
            customerName: params.userName,
            customerEmail: params.userEmail,
            customerPhone: params.userPhone
        };

        const payload = {
            user: params.userId || "",
            total: params.totalAmount,
            shipping_cost: params.shippingFee || 0,
            status: params.status || 'pending',
            payment_id: params.paymentId,
            payment_method: 'credit_card',
            shipping_address: enrichedShippingAddress,
            items: params.items,
        };

        const record = await pbAdmin.collection('orders').create(payload);

        // 2. Trigger Webhook
        // Construct full order matching Order interface
        const fullOrder = {
            id: record.id,
            userId: params.userId || 'guest',
            userName: params.userName,
            userEmail: params.userEmail,
            items: params.items,
            totalAmount: params.totalAmount,
            orderDate: record.created,
            status: (params.status || 'Pending') as any,
            shippingAddress: JSON.stringify(enrichedShippingAddress),
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

export async function updateOrderTrackingCodeAction(orderId: string, trackingCode: string) {
    try {
        console.log(`Updating tracking code for Order ${orderId}`);
        const pbAdmin = await getPocketBaseAdmin();
        await pbAdmin.collection('orders').update(orderId, {
            tracking_code: trackingCode
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateCustomerDetailsAction(
    orderId: string,
    customerData: { userName?: string, userEmail?: string, userPhone?: string },
    shippingAddress?: any
) {
    try {
        console.log(`Updating customer details for Order ${orderId}`);
        const pbAdmin = await getPocketBaseAdmin();

        // 1. Fetch current order to update the nested structured correctly
        const order = await pbAdmin.collection('orders').getOne(orderId);

        // 2. We update the 'shipping_address' which contains the customer info since the 'user' field is just a reference
        const currentShippingAddress = order.shipping_address || {};

        const newShippingAddress = {
            ...currentShippingAddress,
            ...(shippingAddress || {}),
        };

        if (customerData.userName !== undefined) newShippingAddress.customerName = customerData.userName;
        if (customerData.userEmail !== undefined) newShippingAddress.customerEmail = customerData.userEmail;
        if (customerData.userPhone !== undefined) newShippingAddress.customerPhone = customerData.userPhone;

        const payload: any = {
            shipping_address: newShippingAddress
        };

        // Pocketbase has an explicit `user_phone` field too according to previous checks in `fetchOrders`, let's update it if present
        if (customerData.userPhone !== undefined) {
            payload.user_phone = customerData.userPhone;
        }

        await pbAdmin.collection('orders').update(orderId, payload);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating order details:", error);
        return { success: false, message: error.message };
    }
}
