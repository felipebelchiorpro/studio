
import { pb } from '@/lib/pocketbase';
import { Order } from '@/types';
import { processChatwootNotification } from './chatwootService';

async function generateWhatsAppMessage(order: Order, status: string, trackingCode?: string) {
    const customerName = order.userName || order.userEmail || 'Cliente';
    const orderId = order.id.slice(0, 8);
    const productName = order.items && order.items.length > 0 ? order.items[0].name : 'produto';

    // Fallback variable until we have dynamic Pix codes
    const paymentCode = "Acesse o painel do Mercado Pago recebido por e-mail";

    const hour = new Date().getHours();
    let timeContext = '';
    if (hour >= 5 && hour < 12) {
        timeContext = 'Bom dia! Já começamos o dia por aqui cuidando do seu pedido.';
    } else if (hour >= 18 || hour < 5) {
        timeContext = 'Boa noite! Recebemos seu pedido e amanhã cedo ele já entra na nossa fila de prioridade.';
    } else {
        timeContext = 'Boa tarde! Recebemos seu pedido e já estamos no processo por aqui.';
    }

    const farewells = [
        'Qualquer coisa, estou aqui!',
        'Abraços, equipe VENTURE',
        'Tenha um excelente dia!'
    ];
    const randomFarewell = farewells[Math.floor(Math.random() * farewells.length)];

    const cta = `Se tiver qualquer dúvida sobre o ${productName}, é só me chamar por aqui, tá?`;

    switch (status.toLowerCase()) {
        case 'pending':
            return `${timeContext}\n\nAqui está o seu código Pix para finalizar a compra do pedido #${orderId}:\n\n${paymentCode}\n\nAssim que o pagamento cair, te aviso por aqui mesmo!\n\n${randomFarewell}`;

        case 'paid':
            return `Conseguimos confirmar seu pagamento aqui! 🎉\n\nJá estamos preparando tudo com muito carinho para o envio.\n\n${cta}\n\n${randomFarewell}`;

        case 'sent':
        case 'shipped':
            return `Notícia boa! Seu pedido #${orderId} acabou de sair daqui.\n\nO coração chega a bater mais forte, né? 🚚\n\nSeu código de rastreio para acompanhar: ${trackingCode || 'Não informado'}.\n\n${randomFarewell}`;

        case 'packing':
            return `Passando para avisar que o seu pedido #${orderId} já está na nossa mesa de embalagem.\n\nEstamos cuidando de todos os detalhes para enviar rapidinho!\n\n${randomFarewell}`;

        case 'delivered':
            return `O seu pedido #${orderId} acabou de ser entregue!\n\nEspero que você tenha uma ótima experiência. Depois conta pra gente o que achou!\n\n${randomFarewell}`;

        case 'out_for_delivery':
            return `Prepare o coração! O entregador acabou de sair para entregar seu pedido #${orderId} no endereço cadastrado.\n\n${randomFarewell}`;

        default:
            return null;
    }
}

export const triggerOrderCreatedWebhook = async (order: Order) => {
    try {
        const settings = await pb.collection('integration_settings').getFirstListItem('');

        // --- CHATWOOT INTEGRATION FOR ORDER CREATED ---
        const whatsappMessage = await generateWhatsAppMessage(order, 'pending');
        if (whatsappMessage) {
            const chatwootConfig = {
                url: settings.chatwoot_url,
                accountId: settings.chatwoot_account_id,
                token: settings.chatwoot_token,
                inboxId: settings.chatwoot_inbox_id
            };

            if (chatwootConfig.url && chatwootConfig.token) {
                await processChatwootNotification(order, whatsappMessage, chatwootConfig);
                console.log(`Chatwoot message sent for new order: ${order.id}`);
            }
        }
        // ----------------------------------------------

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

        // Chatwoot logic moved to the beginning of the function
        // ---------------------------------------------------

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

        // Parse shipping_address if it's a string
        const address = typeof orderRecord.shipping_address === 'string'
            ? JSON.parse(orderRecord.shipping_address)
            : (orderRecord.shipping_address || {});

        // Map items
        const mappedOrder = {
            id: orderRecord.id,
            userId: orderRecord.user,
            totalAmount: orderRecord.total,
            status: orderRecord.status,
            shippingAddress: address,
            userPhone: (orderRecord.items?.[0] as any)?.userPhone || address.customerPhone || orderRecord.user_phone || '',
            userName: (orderRecord.items?.[0] as any)?.userName || address.customerName || orderRecord.user_name || '',
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
