import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Order } from '@/types';

export const triggerOrderCreatedWebhook = async (order: Order) => {
    // 1. Fetch settings using Admin Client (bypassing RLS if necessary, but here we are admin)
    const { data: settings, error } = await supabaseAdmin
        .from('integration_settings')
        .select('*')
        .single();

    if (error || !settings) {
        console.error('Webhook Trigger: Failed to fetch settings', error);
        return;
    }

    // 2. Check if active
    if (!settings.status_order_created || !settings.webhook_order_created) {
        return; // Webhook disabled or URL missing
    }

    // 3. Prepare Payload
    const payload = {
        event: 'order_created',
        order_id: order.id,
        customer_id: order.userId,
        customer_name: 'Cliente Convidado', // Em app real viria do Auth ou Checkout
        customer_phone: order.userPhone, // Capturado no Checkout
        total: order.totalAmount,
        items: order.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        created_at: new Date().toISOString()
    };

    // 4. Send Request
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'X-Source': 'Ecommerce-Darkstore'
        };

        if (settings.auth_token) {
            headers['Authorization'] = `Bearer ${settings.auth_token}`;
        }

        const response = await fetch(settings.webhook_order_created, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`Webhook Trigger: Remote server returned ${response.status}`);
        } else {
            console.log(`Webhook Trigger: Successfully sent event to ${settings.webhook_order_created}`);
        }
    } catch (err) {
        console.error('Webhook Trigger: Fetch error', err);
    }
};

export const triggerAbandonedCartWebhook = async (cart: any) => {
    // 1. Fetch settings
    const { data: settings, error } = await supabaseAdmin
        .from('integration_settings')
        .select('*')
        .single();

    if (error || !settings) {
        console.error('Webhook Trigger: Failed to fetch settings');
        return;
    }

    // 2. Check if active
    if (!settings.status_abandoned_cart || !settings.webhook_abandoned_cart) {
        return; // Disabled
    }

    // 3. Prepare Payload
    const payload = {
        event: 'abandoned_cart',
        cart_id: cart.id,
        user_email: cart.user_email,
        total: cart.total,
        items: cart.items, // Already JSONB
        abandoned_at: new Date().toISOString()
    };

    // 4. Send Request
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'X-Source': 'Ecommerce-Darkstore-Cron'
        };

        if (settings.auth_token) {
            headers['Authorization'] = `Bearer ${settings.auth_token}`;
        }

        const response = await fetch(settings.webhook_abandoned_cart, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`Abandoned Cart Webhook sent to ${settings.webhook_abandoned_cart}`);
        } else {
            console.error(`Abandoned Cart Webhook failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Abandoned Cart Webhook error:', error);
    }
};
