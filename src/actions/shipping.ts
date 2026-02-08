'use server';

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabaseClient";

export type ShippingRate = {
    id: string;
    city_name: string;
    base_fee: number;
    estimated_delivery_time: string;
    is_active: boolean;
    created_at?: string;
};

export async function getShippingRates() {
    try {
        // Use anon client for reading (Public RLS enabled) to avoid Service Key issues on some environments
        const { data, error } = await supabase
            .from('shipping_rates')
            .select('*')
            .eq('is_active', true)
            .order('base_fee', { ascending: true });

        if (error) {
            console.warn("Error fetching shipping rates (Anon):", error.message);

            // Fallback to Admin if Anon fails (unlikely for public data)
            const { data: adminData, error: adminError } = await supabaseAdmin
                .from('shipping_rates')
                .select('*')
                .eq('is_active', true)
                .order('base_fee', { ascending: true });

            if (adminError) {
                console.warn("Error fetching shipping rates (Admin):", adminError.message);
                return [];
            }
            return adminData as ShippingRate[];
        }

        return data as ShippingRate[];
    } catch (err) {
        console.warn("Exception fetching shipping rates:", err);
        return [];
    }
}

export async function createShippingRate(data: Omit<ShippingRate, 'id' | 'is_active' | 'created_at'>) {
    const { error } = await supabaseAdmin
        .from('shipping_rates')
        .insert(data);

    if (error) {
        console.error("Error creating shipping rate:", error);
        return { success: false, message: error.message };
    }
    return { success: true };
}

export async function updateShippingRate(id: string, data: Partial<ShippingRate>) {
    const { error } = await supabaseAdmin
        .from('shipping_rates')
        .update(data)
        .eq('id', id);

    if (error) {
        console.error("Error updating shipping rate:", error);
        return { success: false, message: error.message };
    }
    return { success: true };
}

export async function deleteShippingRate(id: string) {
    const { error } = await supabaseAdmin
        .from('shipping_rates')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting shipping rate:", error);
        return { success: false, message: error.message };
    }
    return { success: true };
}
