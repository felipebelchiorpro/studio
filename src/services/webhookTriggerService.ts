
import { pb } from '@/lib/pocketbase';
import { Order } from '@/types';
import { processChatwootNotification } from './chatwootService';

async function generateWhatsAppMessage(order: Order, status: string, trackingCode?: string) {
    const customerName = order.userName || order.userEmail || 'Cliente';
    const orderId = order.id.slice(0, 8);

    // Fallback variable until we have dynamic Pix codes
    const paymentCode = "Acesse o painel do Mercado Pago recebido por e-mail";

    switch (status.toLowerCase()) {
        case 'pending':
            return `Recebemos seu pedido #${orderId}. Aqui está o seu código para pagamento: ${paymentCode}.`;

        case 'paid':
            return `Seu pagamento foi aprovado! Já estamos preparando seus itens com carinho.`;

        case 'sent':
        case 'shipped':
            return `Seu pedido #${orderId} já está a caminho! 🚚 Acompanhe pelo código: ${trackingCode || 'Não informado'}.`;

        case 'packing':
            // Added packing because it exists in the system enum, mapping it to a similar out of delivery or packing context
            return `Seu pedido #${orderId} está sendo embalado com todo cuidado!`;

        case 'delivered':
            return `Pedido #${orderId} entregue! Esperamos que goste. Se puder, nos conte o que achou aqui no WhatsApp!`;

        case 'out_for_delivery':
            // Although 'sent' usually is out for delivery, keeping the specific phrase the user asked for 
            return `Prepare o coração! O entregador acabou de sair para entregar seu pedido #${orderId} no endereço cadastrado.`;

        default:
            return null;
    }
}

export const triggerOrderCreatedWebhook = async (order: Order) => {
    try {
        const settings = await pb.collection('integration_settings').getFirstListItem('');

        if (!settings.status_order_created || !settings.webhook_order_created) {
            return;
        }

        const payload = {
            event: 'order_created',
            order_id: order.id,
            customer_id: order.userId,
            customer_name: 'Cliente Convidado',
            customer_phone: order.userPhone,
            total: order.totalAmount,
            items: order.items.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            created_at: new Date().toISOString()
        };

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'X-Source': 'Ecommerce-Darkstore'
        };

        if (settings.auth_token) {
            headers['Authorization'] = `Bearer ${settings.auth_token} `;
        }

        const response = await fetch(settings.webhook_order_created, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`Webhook Trigger: Remote server returned ${response.status} `);
        } else {
            console.log(`Webhook Trigger: Successfully sent event to ${settings.webhook_order_created} `);
        }

    } catch (err: any) {
        if (err.status !== 404) {
            console.error('Webhook Trigger: Error or Settings not found', err);
        }
    }
};

export const triggerAbandonedCartWebhook = async (cart: any) => {
    try {
        const settings = await pb.collection('integration_settings').getFirstListItem('');

        if (!settings.status_abandoned_cart || !settings.webhook_abandoned_cart) {
            return;
        }

        const payload = {
            event: 'abandoned_cart',
            cart_id: cart.id,
            user_email: cart.user_email,
            total: cart.total,
            items: cart.items,
            abandoned_at: new Date().toISOString()
        };

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'X-Source': 'Ecommerce-Darkstore-Cron'
        };

        if (settings.auth_token) {
            headers['Authorization'] = `Bearer ${settings.auth_token} `;
        }

        const response = await fetch(settings.webhook_abandoned_cart, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`Abandoned Cart Webhook sent to ${settings.webhook_abandoned_cart} `);
        } else {
            console.error(`Abandoned Cart Webhook failed: ${response.status} `);
        }

    } catch (error) {
        console.error('Abandoned Cart Webhook error:', error);
    }
};

export const triggerOrderStatusUpdateWebhook = async (orderId: string, newStatus: string) => {
    try {
        const orderRecord = await pb.collection('orders').getOne(orderId);

        // Map items
        const mappedOrder = {
            id: orderRecord.id,
            userId: orderRecord.user,
            totalAmount: orderRecord.total,
            status: orderRecord.status,
            shippingAddress: orderRecord.shipping_address,
            userPhone: (orderRecord.items?.[0] as any)?.userPhone || (orderRecord as any).user_phone || '',
            userName: (orderRecord.items?.[0] as any)?.userName || (orderRecord as any).user_name || '',
            items: (orderRecord.items || []).map((oi: any) => ({
                ...oi,
                name: oi.name, // assuming name in JSON
                categoryId: oi.categoryId || '', // fallback
                quantity: oi.quantity
            }))
        } as Order;

        const settings = await pb.collection('integration_settings').getFirstListItem('');

        // Generate the specific WhatsApp message mapped to the requested status
        const whatsappMessage = await generateWhatsAppMessage(mappedOrder, newStatus, orderRecord.tracking_code);

        if (!whatsappMessage) return; // Status doesn't require a message

        // Extract Chatwoot configs
        const chatwootConfig = {
            url: settings.chatwoot_url,
            accountId: settings.chatwoot_account_id,
            token: settings.chatwoot_token,
            inboxId: settings.chatwoot_inbox_id
        };

        if (chatwootConfig.url && chatwootConfig.token) {
            // Send directly to Chatwoot
            const success = await processChatwootNotification(mappedOrder, whatsappMessage, chatwootConfig);
            if (success) {
                console.log(`Chatwoot message sent for status: ${newStatus}`);
            }
        }

        // Also fire N8N trigger for legacy support/other automations if active for this status
        const n8nUrl = settings.webhook_order_created;
        if (n8nUrl && settings.status_order_created) {
            const payload = {
                event: 'order_status_updated',
                status: newStatus,
                order_id: orderRecord.id,
                customer_phone: mappedOrder.userPhone,
                whatsapp_message: whatsappMessage,
                updated_at: new Date().toISOString()
            };

            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (settings.auth_token) headers['Authorization'] = `Bearer ${settings.auth_token}`;

            await fetch(n8nUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
        }

    } catch (err) {
        console.error("Webhook trigger failed", err);
    }
};
