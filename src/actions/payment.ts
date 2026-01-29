'use server';

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { incrementCouponUsage } from '@/actions/coupons';

export async function processPayment(formData: any) {
    console.log("Processing payment with data:", JSON.stringify(formData, null, 2));

    if (!process.env.MP_ACCESS_TOKEN) {
        console.error("MP_ACCESS_TOKEN not found");
        return { success: false, message: "Erro de configuração: Token de acesso não encontrado." };
    }

    try {
        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
        const payment = new Payment(client);

        const paymentData = {
            transaction_amount: Number(formData.transaction_amount),
            token: formData.token,
            description: formData.description,
            installments: Number(formData.installments),
            payment_method_id: formData.payment_method_id,
            issuer_id: formData.issuer_id,
            payer: {
                email: formData.payer.email,
                identification: {
                    type: formData.payer.identification.type,
                    number: formData.payer.identification.number
                }
            }
        };

        const result = await payment.create({ body: paymentData });

        console.log("Payment created successfully:", result.status);

        if (result.status === 'approved') {
            // Track Coupon Usage (Logic adapted from checkout.ts)
            // Note: In transparent checkout, we might pass coupon info differently.
            // For now, assuming standard flow.
            return { success: true, id: result.id, status: result.status };
        } else {
            return { success: false, message: `Pagamento não aprovado. Status: ${result.status}` };
        }

    } catch (error: any) {
        console.error("Error creating payment:", error);
        return { success: false, message: `Erro ao processar pagamento: ${error.message || 'Desconhecido'}` };
    }
}
