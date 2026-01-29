
import { supabase } from '@/lib/supabaseClient';
import type { IntegrationSettings, WebhookPayload } from '@/types/integration';

export const fetchIntegrationSettingsService = async (): Promise<IntegrationSettings | null> => {
    const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .single();

    if (error) {
        if (error.code === 'PGRST116') { // Not found - should be seeded, but safe check
            return null;
        }
        console.error('Error fetching integration settings:', error);
        return null;
    }
    return data;
};

export const updateIntegrationSettingsService = async (settings: Partial<IntegrationSettings>): Promise<void> => {
    // Upsert logic: if id exists, update. If not (shouldn't happen with seed), Insert.
    // For safety, we check if we have an ID or fetch the single row first.

    // Simplest: update the single existing row or insert if empty table
    const { data: existing } = await supabase.from('integration_settings').select('id').single();

    if (existing) {
        const { error } = await supabase
            .from('integration_settings')
            .update(settings)
            .eq('id', existing.id);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('integration_settings')
            .insert([settings]);
        if (error) throw error;
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
