'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

export interface IntegrationSettings {
    id: string; // usually UUID
    webhook_order_created?: string;
    webhook_abandoned_cart?: string;
    status_order_created?: boolean;
    status_abandoned_cart?: boolean;
    auth_token?: string;
    mp_access_token?: string;
    mp_public_key?: string;
    store_address?: string;
    store_hours?: string;
}

export async function getIntegrationSettings() {
    try {
        const { data, error } = await supabase
            .from('integration_settings')
            .select('*')
            .single();

        if (error) {
            console.error("Error fetching integration settings:", error);
            // If table is empty or error, return default structure to avoid crashes
            return {
                success: false,
                data: null,
                message: error.message
            };
        }

        return { success: true, data: data as IntegrationSettings };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateIntegrationSettings(data: Partial<IntegrationSettings>) {
    try {
        // We assume there's only one row, or we upsert based on a known ID if we had one.
        // Since it's a settings table, often we just update the single existing row.
        // First, check if there is a row.

        const { data: existing } = await supabase.from('integration_settings').select('id').single();

        let error;

        if (existing) {
            const result = await supabase
                .from('integration_settings')
                .update(data)
                .eq('id', existing.id);
            error = result.error;
        } else {
            // If no row exists, insert (rare but possible if fresh db)
            const result = await supabase
                .from('integration_settings')
                .insert([data]);
            error = result.error;
        }

        if (error) {
            console.error("Error updating integration settings:", error);
            return { success: false, message: "Erro ao atualizar configurações." };
        }

        revalidatePath('/dashboard/settings');
        return { success: true, message: "Configurações salvas com sucesso!" };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function testWebhook() {
    try {
        console.log("--- Starting Webhook Test ---");
        const settingsRes = await getIntegrationSettings();

        if (!settingsRes.success || !settingsRes.data || !settingsRes.data.webhook_order_created) {
            console.error("Webhook Test Failed: URL missing or settings fetch failed.", settingsRes);
            return { success: false, message: "URL do webhook não configurada." };
        }

        const settings = settingsRes.data;
        const url = settings.webhook_order_created;
        console.log("Target URL:", url);

        const payload = {
            event: 'test_event',
            message: 'Isso é um teste de integração do Ecommerce DarkStore.',
            timestamp: new Date().toISOString()
        };

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'X-Source': 'Ecommerce-Darkstore-Test'
        };

        if (settings.auth_token) {
            headers['Authorization'] = `Bearer ${settings.auth_token}`;
            console.log("Auth Token present in headers.");
        }

        console.log("Sending payload:", JSON.stringify(payload));

        const response = await fetch(url as string, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        console.log("Response Status:", response.status);
        console.log("Response Text:", response.statusText);

        if (response.ok) {
            return { success: true, message: `Teste enviado com sucesso! Status: ${response.status}` };
        } else {
            const body = await response.text();
            console.error("Webhook Response Body:", body);
            return { success: false, message: `Falha no envio. Servidor respondeu: ${response.status} ${response.statusText}` };
        }

    } catch (error: any) {
        console.error("Webhook Test Exception:", error);
        return { success: false, message: `Erro ao testar webhook: ${error.message}` };
    }
}
