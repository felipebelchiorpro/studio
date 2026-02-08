
import { supabase } from '@/lib/supabaseClient';

export type ShippingRate = {
    id: string;
    city_name: string;
    base_fee: number;
    estimated_delivery_time: string;
    is_active: boolean;
    created_at?: string;
};

export async function fetchShippingRatesService() {
    try {
        const { data, error } = await supabase
            .from('shipping_rates')
            .select('*')
            .order('base_fee', { ascending: true });

        if (error) {
            console.error("Error fetching shipping rates:", JSON.stringify(error, null, 2));
            return [];
        }

        return data as ShippingRate[];
    } catch (err) {
        console.warn("Exception fetching shipping rates:", err);
        return [];
    }
}

export async function createShippingRateService(data: Omit<ShippingRate, 'id' | 'is_active' | 'created_at'>) {
    const { error } = await supabase
        .from('shipping_rates')
        .insert(data);

    if (error) {
        console.error("Error creating shipping rate:", JSON.stringify(error, null, 2));
        return { success: false, message: error.message || "Erro desconhecido ao criar frete." };
    }
    return { success: true };
}

export async function updateShippingRateService(id: string, data: Partial<ShippingRate>) {
    const { error } = await supabase
        .from('shipping_rates')
        .update(data)
        .eq('id', id);

    if (error) {
        console.error("Error updating shipping rate:", error);
        return { success: false, message: error.message };
    }
    return { success: true };
}

export async function deleteShippingRateService(id: string) {
    const { error } = await supabase
        .from('shipping_rates')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting shipping rate:", error);
        return { success: false, message: error.message };
    }
    return { success: true };
}
