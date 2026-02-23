'use server';

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { triggerOrderCreatedWebhook } from '@/services/webhookTriggerService';
import { incrementCouponUsage } from '@/actions/coupons';
import { headers } from 'next/headers';

import { createOrderAction } from '@/actions/order';
import { getIntegrationSettings } from '@/actions/settings';

export async function processCheckout(
    cartItems: any[],
    total: number,
    user: { id?: string, email: string, phone: string },
    shippingInfo: { method: string, address?: any, fee: number }
) {
    console.log("Processing checkout Pro for", user.email);

    // ... inside processCheckout ...

    const settingsRes = await getIntegrationSettings();
    const mpAccessToken = settingsRes.success && settingsRes.data?.mp_access_token
        ? settingsRes.data.mp_access_token
        : process.env.MP_ACCESS_TOKEN;

    if (!mpAccessToken) {
        console.error("MP_ACCESS_TOKEN not found in DB or Env");
        return { success: false, message: "Erro de configuração de pagamento: Token não encontrado." };
    }

    try {
        // 1. Create Order with 'Pending' status
        const orderRes = await createOrderAction({
            userId: user.id || undefined,
            items: cartItems,
            totalAmount: total + shippingInfo.fee,
            paymentId: 'pending_mp_redirect',
            status: 'Pending', // Initial status
            userEmail: user.email,
            userPhone: user.phone,
            shippingFee: shippingInfo.fee,
            shippingAddress: shippingInfo.method === 'shipping' ? shippingInfo.address : { type: 'pickup' }
        });

        if (!orderRes.success || !orderRes.orderId) {
            return { success: false, message: `Erro ao criar pedido: ${orderRes.message}` };
        }

        const orderId = orderRes.orderId;

        // 2. Initializa MP and Create Preference
        const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
        const preference = new Preference(client);

        const items = cartItems.map(item => {
            let itemTitle = item.name;
            const variations = [];
            if (item.selectedFlavor) variations.push(`Sabor: ${item.selectedFlavor}`);
            if (item.selectedSize) variations.push(`Tam: ${item.selectedSize}`);

            if (variations.length > 0) {
                itemTitle += ` (${variations.join(' | ')})`;
            }

            return {
                id: item.id,
                title: itemTitle,
                picture_url: item.imageUrl || undefined,
                quantity: item.quantity,
                unit_price: Number(item.price)
            };
        });

        if (shippingInfo.fee > 0) {
            items.push({
                id: 'shipping-fee',
                title: 'Frete / Entrega',
                picture_url: undefined,
                quantity: 1,
                unit_price: Number(shippingInfo.fee)
            });
        }

        // Resolve base URL dynamically to ensure back_urls are correct in any environment
        const headersList = await headers();
        const host = headersList.get('host');
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${protocol}://${host}` : 'http://localhost:3000');

        const preferenceData = {
            items: items,
            payer: {
                email: user.email,
                phone: {
                    area_code: user.phone.substring(0, 2),
                    number: user.phone.substring(2)
                }
            },
            back_urls: {
                success: `${baseUrl}/checkout/success?order_id=${orderId}`,
                failure: `${baseUrl}/checkout/failure?order_id=${orderId}`,
                pending: `${baseUrl}/checkout/pending?order_id=${orderId}`,
            },
            auto_return: 'approved',
            external_reference: orderId, // LINK THE ORDER ID HERE
            metadata: {
                order_id: orderId,
                email: user.email
            }
        };

        console.log("Creating preference for Order:", orderId);

        const result = await preference.create({
            body: preferenceData
        });

        if (result.init_point) {
            return { success: true, url: result.init_point, orderId: orderId };
        } else {
            return { success: false, message: "Falha ao obter link de pagamento." };
        }

    } catch (error: any) {
        console.error("Checkout Pro Error:", error);
        return { success: false, message: error.message };
    }
}
