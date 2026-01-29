'use server';

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { triggerOrderCreatedWebhook } from '@/services/webhookTriggerService';
import { incrementCouponUsage } from '@/actions/coupons';

export async function processCheckout(cartItems: any[], total: number, phone?: string) {
    console.log("Processing checkout for", cartItems.length, "items", "Phone:", phone);

    if (!process.env.MP_ACCESS_TOKEN) {
        console.error("MP_ACCESS_TOKEN not found");
        return { success: false, message: "Erro de configuração de pagamento. Token não encontrado." };
    }

    try {
        // Initialize client here to ensure we use the latest env var
        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
        const preference = new Preference(client);

        const items = cartItems.map(item => ({
            id: item.id,
            title: item.name,
            quantity: item.quantity,
            unit_price: Number(item.price)
        }));

        console.log("Creating preference with items:", items.length);

        // Determine Base URL reliably
        // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'; 

        // HARDCODED for debugging to ensure no empty string issues
        const baseUrl = 'http://localhost:3001';

        // Construct absolute URLs
        const backUrls = {
            success: `${baseUrl}/checkout/success`,
            failure: `${baseUrl}/checkout/failure`,
            pending: `${baseUrl}/checkout/pending`,
        };

        const preferenceData = {
            items: items,
            backUrls: backUrls, // Try camelCase
            autoReturn: 'approved', // Try camelCase
            externalReference: `ORD-${Date.now()}-${phone}`, // Try camelCase
            metadata: {
                phone: phone
            }
        };

        console.log("Creating preference with payload:", JSON.stringify(preferenceData, null, 2));

        const result = await preference.create({
            body: preferenceData
        });

        if (result.init_point) {
            console.log("Preference created successfully:", result.init_point);

            // Track Coupon Usage (Optimistic)
            const usedCoupons = new Set<string>();
            cartItems.forEach(item => {
                if (item.couponCode) {
                    usedCoupons.add(item.couponCode);
                }
            });

            for (const code of Array.from(usedCoupons)) {
                await incrementCouponUsage(code);
            }

            return { success: true, url: result.init_point };
        } else {
            console.error("Result missing init_point", result);
            return { success: false, message: "Falha ao criar preferência de pagamento (sem URL)." };
        }

    } catch (error: any) {
        console.error("Error creating preference:", error);
        return { success: false, message: `Erro ao processar pagamento: ${error.message || 'Desconhecido'}` };
    }
}
