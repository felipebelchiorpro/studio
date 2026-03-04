
import { pb } from '@/lib/pocketbase';
import { Order } from '@/types';
import { processChatwootNotification } from './chatwootService';

async function generateWhatsAppMessage(order: Order, status: string, trackingCode?: string) {
    const customerName = order.userName || order.userEmail || 'Cliente';
    const firstName = customerName.split(' ')[0] !== 'Cliente' && customerName.split(' ')[0].length > 1 ? customerName.split(' ')[0] : 'Cliente';
    const orderId = order.id.slice(0, 8);

    switch (status.toLowerCase()) {
        case 'pending':
            let orderItemsString = '';
            let subtotal = 0;

            if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    subtotal += itemTotal;
                    orderItemsString += `\n${item.name} — ${item.quantity}x — Valor Unitário: R$ ${item.price.toFixed(2).replace('.', ',')} 🏷️`;
                });
            } else {
                orderItemsString = '\nItens indisponíveis 🏷️';
            }

            // Fallback para shippingCost e desconto se não estiverem presentes no objeto inicial
            const shippingCost = (order as any).shippingCost || 0; // Se o type original não comportava

            // O totalAmount vem do banco. subtotal + frete - total = desconto (se positivo)
            const calculatedDiscount = Math.max(0, (subtotal + shippingCost) - order.totalAmount);
            const cupom = (order.items && order.items[0]?.couponCode) ? order.items[0].couponCode : "Nenhum";

            return `Assunto: Pedido Recebido! Detalhes dos itens e valores #${orderId} 💎\n\nOlá, ${firstName},\n\nRecebemos o seu pedido na DarkStore! 🌑 Ele já está registrado em nossa base sob o ID #${orderId}. Confira abaixo o detalhamento completo da sua compra:\n\n📦 Resumo dos Itens:${orderItemsString}\n\n📊 Resumo Financeiro:\n\nSubtotal: R$ ${subtotal.toFixed(2).replace('.', ',')} 💵\n\nFrete: R$ ${shippingCost.toFixed(2).replace('.', ',')} 🚚\n\nCupom: ${cupom} 🎟️\n\nDesconto Aplicado: - R$ ${calculatedDiscount.toFixed(2).replace('.', ',')} ✨\n\nTOTAL: R$ ${order.totalAmount.toFixed(2).replace('.', ',')} 💰\n\n🚀 Próximos Passos:\nEstamos aguardando a confirmação do seu pagamento. Assim que o status mudar para Aprovado, iniciaremos a preparação do seu pacote imediatamente. ⚡\n\nAgradecemos a confiança em nossa loja.`;

        case 'paid':
            return `Assunto: Pagamento Aprovado! Tudo pronto para o próximo passo 💎\n\nÓtimas notícias, ${firstName}! ⚡\n\nO pagamento do seu pedido #${orderId} foi validado com sucesso. Agora, ele entrou oficialmente em nossa fila de processamento. 🛠️\n\nPróximo passo: Seu pedido será encaminhado para o setor de triagem e conferência de estoque. 🔍`;

        case 'packing':
            return `Assunto: Preparação: Estamos montando o seu pacote 🛠️\n\nOlá, ${firstName},\n\nSeu pedido #${orderId} está na fase de separação. 📦 Nossa equipe está conferindo cada item e preparando a embalagem para garantir que sua suplementação chegue em perfeitas condições. 🛡️\n\nStatus Atual: Embalando (Separação) 🏗️\n\nEm breve, você receberá o alerta de envio com seu código de rastreio. 📡`;

        case 'sent':
        case 'shipped':
            return `Assunto: Pedido Enviado! Sua encomenda está a caminho 🚀\n\nSeu pedido foi enviado! 💨\n\nA logística da DarkStore concluiu o despacho do seu pedido #${orderId}. Ele agora está em trânsito para o seu endereço. 📍\n\n📦 Detalhes do Rastreio:\n\nCódigo de Rastreio: ${trackingCode || 'Não informado ainda'} 🆔\n\nLink de Rastreio: ${trackingCode ? 'Verifique na transportadora com seu código' : 'Aguarde atualização'} 🔗\n\nAcompanhe o trajeto em tempo real e prepare-se para a entrega! ⚡`;

        case 'delivered':
            return `Assunto: Entregue! O que você achou da experiência? 🏆\n\nOlá, ${firstName},\n\nConsta em nosso sistema que o seu pedido #${orderId} foi entregue com sucesso! 🎉 Esperamos que os produtos ajudem você a atingir seus objetivos e sua melhor performance. 🧬\n\nAvaliação:\nSua opinião é fundamental para nossa estratégia de crescimento. 📈 Se puder, avalie sua experiência conosco respondendo a esta mensagem! ⭐`;

        case 'cancelled':
            return `Assunto: Pedido Cancelado: Houve um problema com sua compra ⚠️\n\nOlá, ${firstName},\n\nInformamos que o pedido #${orderId} foi cancelado em nosso sistema. 🚫\n\nPossíveis causas:\n\nO pagamento não foi identificado no prazo estipulado. ⏳\n\nHouve uma falha na comunicação com o seu banco ou operadora de cartão. 💳\n\nCaso queira refazer sua compra ou precise de suporte, entre em contato conosco por aqui mesmo. 🛠️`;

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
            })),
            shippingCost: orderRecord.shipping_cost || 0
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
