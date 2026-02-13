'use server';

import { getPocketBaseAdmin } from "@/lib/pocketbaseAdmin";
import { revalidatePath } from 'next/cache';

export interface IntegrationSettings {
    id: string; // PB ID
    webhook_order_created?: string;
    webhook_abandoned_cart?: string;
    status_order_created?: boolean;
    status_abandoned_cart?: boolean;
    auth_token?: string;
    mp_access_token?: string;
    mp_public_key?: string;
    store_address?: string;
    store_hours?: string;
    created_at?: string;
    updated_at?: string;
}

export async function getIntegrationSettings() {
    const pb = await getPocketBaseAdmin();
    try {
        // Assume single row.
        const settings = await pb.collection('integration_settings').getFirstListItem('');

        return {
            success: true, data: {
                id: settings.id,
                webhook_order_created: settings.webhook_order_created,
                webhook_abandoned_cart: settings.webhook_abandoned_cart,
                status_order_created: settings.status_order_created,
                status_abandoned_cart: settings.status_abandoned_cart,
                auth_token: settings.auth_token,
                mp_access_token: settings.mp_access_token,
                mp_public_key: settings.mp_public_key,
                store_address: settings.store_address,
                store_hours: settings.store_hours,
                created_at: settings.created,
                updated_at: settings.updated
            } as IntegrationSettings
        };

    } catch (error: any) {
        if (error.status === 404) {
            // Return empty or defaults if not found
            return { success: true, data: null };
        }
        console.error("Error fetching integration settings:", error);
        return { success: false, message: error.message };
    }
}

export async function updateIntegrationSettings(data: Partial<IntegrationSettings>) {
    const pb = await getPocketBaseAdmin();
    try {
        // Check if exists
        let existingId;
        try {
            const existing = await pb.collection('integration_settings').getFirstListItem('');
            existingId = existing.id;
        } catch (e: any) {
            if (e.status !== 404) throw e;
        }

        if (existingId) {
            await pb.collection('integration_settings').update(existingId, data);
        } else {
            // Create
            await pb.collection('integration_settings').create(data);
        }

        revalidatePath('/dashboard/settings');
        return { success: true, message: "Configurações salvas com sucesso!" };

    } catch (error: any) {
        console.error("Error updating integration settings:", error);
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
