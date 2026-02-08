'use server';

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

export type WhatsappAutomation = {
    id: string;
    event_type: string;
    name: string;
    description: string;
    message_template: string;
    is_active: boolean;
    delay_minutes: number;
    updated_at: string;
};

export async function getAutomations() {
    const { data, error } = await supabaseAdmin
        .from('whatsapp_automations')
        .select('*')
        .order('name'); // or event_type

    if (error) {
        console.error("Error fetching automations:", error);
        return [];
    }

    return data as WhatsappAutomation[];
}

export async function updateAutomation(id: string, updates: Partial<WhatsappAutomation>) {
    const { message_template, is_active, delay_minutes } = updates;

    // Validate
    if (updates.delay_minutes !== undefined && updates.delay_minutes < 0) {
        return { success: false, message: "O tempo de atraso não pode ser negativo." };
    }

    const { error } = await supabaseAdmin
        .from('whatsapp_automations')
        .update({
            message_template,
            is_active,
            delay_minutes,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        console.error("Error updating automation:", error);
        return { success: false, message: "Erro ao atualizar automação." };
    }

    revalidatePath('/dashboard/automations');
    return { success: true };
}

export async function getAutomationByEvent(eventType: string) {
    const { data, error } = await supabaseAdmin
        .from('whatsapp_automations')
        .select('*')
        .eq('event_type', eventType)
        .single();

    if (error) {
        return null;
    }

    return data as WhatsappAutomation;
}
