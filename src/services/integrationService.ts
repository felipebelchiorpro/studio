
import { pb } from '@/lib/pocketbase';
import type { IntegrationSettings, WebhookPayload } from '@/types/integration';

export const fetchIntegrationSettingsService = async (): Promise<IntegrationSettings | null> => {
    try {
        // PB doesn't support .single() on list unless we filter, but getFirstListItem does.
        // Or we can assume there is only one record.
        const record = await pb.collection('integration_settings').getFirstListItem('');
        return {
            id: record.id,
            status_order_created: record.status_order_created,
            webhook_order_created: record.webhook_order_created,
            status_abandoned_cart: record.status_abandoned_cart,
            webhook_abandoned_cart: record.webhook_abandoned_cart,
            auth_token: record.auth_token,
            store_address: record.store_address,
            store_hours: record.store_hours,
            created_at: record.created,
            updated_at: record.updated
        };
    } catch (error: any) {
        if (error.status === 404) {
            // Create default if missing? Or return null.
            return null;
        }
        console.error('Error fetching integration settings:', error);
        return null;
    }
};

export const updateIntegrationSettingsService = async (settings: Partial<IntegrationSettings>): Promise<void> => {
    try {
        // Check if exists
        let record;
        try {
            record = await pb.collection('integration_settings').getFirstListItem('');
        } catch (e: any) {
            if (e.status !== 404) throw e;
        }

        if (record) {
            await pb.collection('integration_settings').update(record.id, settings);
        } else {
            // Create
            await pb.collection('integration_settings').create(settings);
        }
    } catch (error) {
        console.error('Error updating integration settings:', error);
        throw error;
    }
};

export const testWebhookService = async (url: string, event: 'order_created' | 'abandoned_cart'): Promise<{ success: boolean; message: string }> => {
    if (!url) return { success: false, message: 'URL do Webhook não configurada.' };

    const mockPayload: WebhookPayload | any = event === 'order_created' ? {
        event: 'order_created',
        order_id: 'TEST-12345',
        customer_id: 'guest-user-123',
        customer_name: 'Felipe Belchior',
        customer_phone: '5519998277880', // Número de teste atualizado
        total: 99.90,
        items: [{ name: 'Produto Teste', quantity: 1, price: 99.90 }],
        created_at: new Date().toISOString()
    } : {
        event: 'abandoned_cart',
        cart_id: 'CART-TEST-888',
        user_email: 'teste@exemplo.com',
        total: 99.90,
        items: [{ name: 'Produto Teste', quantity: 1 }],
        abandoned_at: new Date().toISOString()
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockPayload),
        });

        if (response.ok) {
            return { success: true, message: 'Disparo de teste enviado com sucesso!' };
        } else {
            return { success: false, message: `Erro no disparo: ${response.status} ${response.statusText}` };
        }
    } catch (error: any) {
        return { success: false, message: `Falha na requisição: ${error.message}` };
    }
};
