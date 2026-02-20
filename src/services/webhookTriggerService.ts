
import { pb } from '@/lib/pocketbase';
import { Order } from '@/types';

async function generateWhatsAppMessage(order: Order, status: string, settings: any) {
    // 1. Identify Category Types
    // Fetch all categories to check types
    let categories: any[] = [];
    try {
        categories = await pb.collection('categories').getFullList({ fields: 'id,type' });
    } catch (e) { console.error('Error fetching categories for webhook:', e); }

    const categoryMap = new Map(categories.map(c => [c.id, c.type]));

    let hasSupplement = false;
    let hasClothing = false;

    order.items.forEach((item: any) => {
        // item might have categoryId if passed from Order object, or we need to look it up?
        // In PB migration, I'm not storing categoryId in order item JSON explicitly unless I added it.
        // Assuming item.categoryId exists or we infer.
        // If items come from `orderService` rewrite, I might need to ensure categoryId is there.
        // For now, let's assume item has it or we skip specific check.
        const type = categoryMap.get(item.categoryId);
        if (type === 'supplement') hasSupplement = true;
        if (type === 'clothing') hasClothing = true;
    });

    let detalheConferencia = "seus produtos";
    if (hasSupplement && hasClothing) {
        detalheConferencia = "seus suplementos e o tamanho das suas roupas";
    } else if (hasSupplement) {
        detalheConferencia = "seus suplementos e a integridade dos lacres";
    } else if (hasClothing) {
        detalheConferencia = "as peças e os tamanhos das suas roupas";
    } else {
        detalheConferencia = "seus produtos com todo cuidado";
    }

    // 2. Templates
    const customerName = order.userId === 'guest' ? (order as any).user_name || 'Cliente' : 'Cliente';
    const isPickup = order.shippingAddress && (typeof order.shippingAddress === 'string' ? order.shippingAddress.includes('pickup') : (order.shippingAddress as any).type === 'pickup');

    const itemsList = order.items.map((i: any) => `${i.quantity}x ${i.name} `).join(', ');
    const total = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount);
    // Safe access for city
    let city = "sua região";
    if (order.shippingAddress) {
        if (typeof order.shippingAddress === 'string') {
            // Try parse? or just leave default
            try {
                const parsed = JSON.parse(order.shippingAddress);
                if (parsed.city) city = parsed.city;
            } catch { }
        } else if ((order.shippingAddress as any).city) {
            city = (order.shippingAddress as any).city;
        }
    }

    let message = "";

    switch (status) {
        case 'Confirmed': // Pedido Confirmado
        case 'pending': // Match PB status
        case 'Pending':
        case 'paid': // Added paid status
            if (isPickup) {
                message = `✅ Pedido Confirmado para Retirada!\n\nOlá ${customerName}, recebemos seu pedido!\n🛒 Itens: ${itemsList} \n💰 Total: ${total} \n\nAguarde: Enviaremos uma mensagem assim que tudo estiver separado para você vir buscar aqui na loja em Caconde.`;
            } else {
                message = `✅ Pedido Confirmado!\n\nOlá ${customerName}, seu kit de performance já está no nosso sistema!\n🛒 Itens: ${itemsList} \n🚚 Envio para: ${city} \n💰 Total: ${total} \n\nAvisaremos você assim que iniciarmos a embalagem.`;
            }
            break;

        case 'Packing': // Embalagem
        case 'packing':
            message = `📦 Seu pedido está sendo embalado!\n\nEstamos conferindo ${detalheConferencia} com todo cuidado.O seu pacote está sendo preparado para o envio ou retirada!`;
            break;

        case 'Delivered': // Saiu para Entrega / Pronto
        case 'sent': // Matches PB schema 'sent'
        case 'delivered':
            // If status is 'sent', it usually means out for delivery. 'delivered' means done.
            // Adapting message for 'sent' as 'Saiu para Entrega'.
            if (isPickup) {
                const loja = settings.store_address || "[Endereço da Loja]";
                const horario = settings.store_hours || "[Horário]";
                message = `🏪 Tudo pronto! Pode vir retirar.\n\nSeu pedido já está embalado e te esperando no balcão.\n📍 Loja: ${loja} \n⏰ Horário: ${horario} \n\nÉ só chegar e informar seu nome ou o número do pedido: #${order.id.slice(0, 8)}.`;
            } else {
                message = `🛵 Seu pedido saiu para entrega!\n\nO entregador já está a caminho de ${city}. Logo você terá seus produtos em mãos para o seu treino ou dia a dia! 💪`;
            }
            break;

        default:
            return null;
    }

    return message
        .replace('{nome_cliente}', customerName)
        .replace('{lista_resumida_produtos}', itemsList)
        .replace('{cidade}', city)
        .replace('{valor_total}', total)
        .replace('{detalhe_conferencia}', detalheConferencia)
        .replace('{endereco_loja}', settings.store_address || '')
        .replace('{horario_funcionamento}', settings.store_hours || '')
        .replace('{id_pedido}', order.id.slice(0, 8));
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
            items: (orderRecord.items || []).map((oi: any) => ({
                ...oi,
                name: oi.name, // assuming name in JSON
                categoryId: oi.categoryId || '', // fallback
                quantity: oi.quantity
            }))
        } as Order;

        const settings = await pb.collection('integration_settings').getFirstListItem('');

        const whatsappMessage = await generateWhatsAppMessage(mappedOrder, newStatus, settings);

        const webhookUrl = settings.webhook_order_created; // Using same webhook or should be a different one? Original code used `webhook_order_created` for status updates too (logic line 232)

        if (!webhookUrl) return;

        const payload = {
            event: 'order_status_updated',
            status: newStatus,
            order_id: orderRecord.id,
            customer_id: orderRecord.user,
            customer_phone: (orderRecord.items?.[0] as any)?.userPhone || (orderRecord as any).user_phone || '', // Extracting from items or record
            whatsapp_message: whatsappMessage,
            updated_at: new Date().toISOString()
        };

        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (settings.auth_token) headers['Authorization'] = `Bearer ${settings.auth_token}`;

        await fetch(webhookUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        console.log(`Status Webhook sent: ${newStatus}`);

    } catch (err) {
        console.error("Webhook trigger failed", err);
    }
};
