'use server';

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getIntegrationSettings } from '@/actions/settings';
import { updateOrderStatusAction } from '@/actions/order';

export async function checkPaymentStatusByOrderId(orderId: string) {
    try {
        console.log(`Checking MP payment status for order: ${orderId}`);

        const settingsRes = await getIntegrationSettings();
        const mpAccessToken = settingsRes.success && settingsRes.data?.mp_access_token
            ? settingsRes.data.mp_access_token
            : process.env.MP_ACCESS_TOKEN;

        if (!mpAccessToken) {
            return { success: false, message: "Token do Mercado Pago não encontrado nas configurações." };
        }

        const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
        const payment = new Payment(client);

        // Search for payments linked to this order
        const searchResult = await payment.search({
            options: {
                external_reference: orderId,
                sort: 'date_created',
                criteria: 'desc'
            }
        });

        if (!searchResult.results || searchResult.results.length === 0) {
            return { success: false, message: "Nenhum pagamento encontrado no Mercado Pago para este pedido." };
        }

        // We get the most recent payment attempt for this order
        const latestPayment = searchResult.results[0];
        const status = latestPayment.status;

        console.log(`MP Status for ${orderId}: ${status}`);

        let newLocalStatus = 'pending';
        let actionMessage = "O pagamento ainda está pendente ou em análise no Mercado Pago.";

        if (status === 'approved') {
            newLocalStatus = 'paid';
            actionMessage = "Pagamento aprovado no Mercado Pago! Status atualizado com sucesso.";
            // Update order status in PB
            await updateOrderStatusAction(orderId, newLocalStatus);
            return { success: true, message: actionMessage, updateTo: newLocalStatus, mpStatus: status, mpId: latestPayment.id };
        } else if (status === 'rejected' || status === 'cancelled') {
            newLocalStatus = 'cancelled';
            actionMessage = "O pagamento foi recusado ou cancelado no Mercado Pago.";
            // We optionally could auto-cancel the order here or let the admin do it.
            return { success: true, message: actionMessage, mpStatus: status, mpId: latestPayment.id };
        } else if (status === 'in_process' || status === 'pending') {
            return { success: true, message: actionMessage, mpStatus: status, mpId: latestPayment.id };
        } else {
            return { success: true, message: `Status do Mercado Pago: ${status}`, mpStatus: status, mpId: latestPayment.id };
        }

    } catch (error: any) {
        console.error("Error checking MP payment status:", error);
        return { success: false, message: "Erro ao consultar a API do Mercado Pago." };
    }
}
