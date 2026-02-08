'use server';

import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
        const { data, error } = await supabaseAdmin
            .from('shipping_rates')
            .select('*')
            .eq('is_active', true)
            .order('base_fee', { ascending: true });

        if (error) {
            console.warn("Error fetching shipping rates:", error.message);
            return []; // Return empty array to allow manual config from scratch
        }

        return data as ShippingRate[];
    } catch (err) {
        console.warn("Exception fetching shipping rates:", err);
        return [];
    }
}

// function getFallbackRates(): ShippingRate[] {
//     return [];
// }

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

