
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Order } from '@/types';
async function generateWhatsAppMessage(order: Order, status: string, settings: any) {
    // 1. Identify Category Types
    // We need to fetch categories to check types
    const { data: categories } = await supabaseAdmin.from('categories').select('id, type');
    const categoryMap = new Map(categories?.map(c => [c.id, c.type]) || []);

    let hasSupplement = false;
    let hasClothing = false;

    // Use order.items which are CartItems -> Product
    order.items.forEach((item: any) => {
        // item.categoryId might be missing if not populated, check backing product if needed
        // Assuming item.categoryId is present.
        const type = categoryMap.get(item.categoryId);
        if (type === 'supplement') hasSupplement = true;
        if (type === 'clothing') hasClothing = true;
        // If undefined, maybe treat as supplement or check name?
        // Fallback: Check name?
    });

    let detalheConferencia = "seus produtos";
    if (hasSupplement && hasClothing) {
        detalheConferencia = "seus suplementos e o tamanho das suas roupas";
    } else if (hasSupplement) {
        detalheConferencia = "seus suplementos e a integridade dos lacres";
    } else if (hasClothing) {
        detalheConferencia = "as peças e os tamanhos das suas roupas";
    } else {
        // Default fallback if types not found
        detalheConferencia = "seus produtos com todo cuidado";
    }

    // 2. Templates
    const customerName = order.userId === 'guest' ? (order as any).user_name || 'Cliente' : 'Cliente'; // Need name!
    const isPickup = order.shippingAddress && (typeof order.shippingAddress === 'string' ? order.shippingAddress.includes('pickup') : (order.shippingAddress as any).type === 'pickup');

    const itemsList = order.items.map((i: any) => `${i.quantity}x ${i.name} `).join(', ');
    const total = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount);
    const city = (typeof order.shippingAddress === 'object' && (order.shippingAddress as any).city) ? (order.shippingAddress as any).city : "sua região";

    let message = "";

    switch (status) {
        case 'Confirmed': // Pedido Confirmado
            if (isPickup) {
                message = `✅ Pedido Confirmado para Retirada!\n\nOlá ${customerName}, recebemos seu pedido!\n🛒 Itens: ${itemsList} \n💰 Total: ${total} \n\nAguarde: Enviaremos uma mensagem assim que tudo estiver separado para você vir buscar aqui na loja em Caconde.`;
            } else {
                message = `✅ Pedido Confirmado!\n\nOlá ${customerName}, seu kit de performance já está no nosso sistema!\n🛒 Itens: ${itemsList} \n🚚 Envio para: ${city} \n💰 Total: ${total} \n\nAvisaremos você assim que iniciarmos a embalagem.`;
            }
            break;

        case 'Packing': // Embalagem
            message = `📦 Seu pedido está sendo embalado!\n\nEstamos conferindo ${detalheConferencia} com todo cuidado.O seu pacote está sendo preparado para o envio ou retirada!`;
            break;

        case 'Delivered': // Saiu para Entrega / Pronto
            if (isPickup) {
                const loja = settings.store_address || "[Endereço da Loja]";
                const horario = settings.store_hours || "[Horário]";
                message = `🏪 Tudo pronto! Pode vir retirar.\n\nSeu pedido já está embalado e te esperando no balcão.\n📍 Loja: ${loja} \n⏰ Horário: ${horario} \n\nÉ só chegar e informar seu nome ou o número do pedido: #${order.id.slice(0, 8)}.`;
            } else {
                message = `🛵 Seu pedido saiu para entrega!\n\nO entregador já está a caminho de ${city}. Logo você terá seus produtos em mãos para o seu treino ou dia a dia! 💪`;
            }
            break;

        default:
            return null; // No message for other statuses
    }

    // Replace placeholders just in case
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
    // 1. Fetch settings using Anon Client
    const { data: settings, error } = await supabase
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
    } catch (err) {
        console.error('Webhook Trigger: Fetch error', err);
    }
};

export const triggerAbandonedCartWebhook = async (cart: any) => {
    // 1. Fetch settings
    const { data: settings, error } = await supabase
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
    // 1. Fetch Order Data
    const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select(`*, order_items(*, products(*))`)
        .eq('id', orderId)
        .single();

    if (orderError || !order) {
        console.error("Webhook: Order not found", orderError);
        return;
    }

    // Map items for helper compatibility
    const mappedOrder = {
        ...order,
        items: (order.order_items || []).map((oi: any) => ({
            ...oi,
            name: oi.products?.name,
            categoryId: oi.products?.category_id,
            quantity: oi.quantity
        }))
    };

    // 2. Fetch Settings
    const { data: settings } = await supabaseAdmin.from('integration_settings').select('*').single();
    if (!settings) return;

    // 3. Generate Message
    const whatsappMessage = await generateWhatsAppMessage(mappedOrder as any, newStatus, settings);

    // 4. Send Webhook
    const webhookUrl = settings.webhook_order_created;

    if (!webhookUrl) return;

    const payload = {
        event: 'order_status_updated',
        status: newStatus,
        order_id: order.id,
        customer_id: order.user_id,
        customer_phone: order.user_phone,
        whatsapp_message: whatsappMessage,
        updated_at: new Date().toISOString()
    };

    try {
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
