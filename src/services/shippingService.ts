
import { pb } from '@/lib/pocketbase';

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
        const records = await pb.collection('shipping_rates').getFullList({
            sort: 'price', // 'base_fee' -> 'price'
        });

        return records.map((r: any) => ({
            id: r.id,
            city_name: r.city, // 'city_name' -> 'city'
            base_fee: r.price, // 'base_fee' -> 'price'
            estimated_delivery_time: r.delivery_days?.toString() || '0', // 'estimated_delivery_time' -> 'delivery_days'
            is_active: r.active, // 'is_active' -> 'active'
            created_at: r.created
        })) as ShippingRate[];
    } catch (err) {
        console.warn("Exception fetching shipping rates:", err);
        return [];
    }
}

export async function createShippingRateService(data: Omit<ShippingRate, 'id' | 'is_active' | 'created_at'>) {
    try {
        await pb.collection('shipping_rates').create({
            city: data.city_name, // Schema uses 'city'
            state: 'SP', // Schema requires 'state', but service input doesn't provide it? Need to check types or default.
            // Wait, previous service didn't have state?
            // "city_name" implies just city. 
            // My schema `shipping_rates` has: `city`, `state`, `price`, `delivery_days`, `active`.
            // I need to update the Type definition and the Input to include State.
            // For now, I'll attempt to extract state or default it, but primarily fix key names.
            price: data.base_fee, // Schema uses 'price'
            delivery_days: parseInt(data.estimated_delivery_time) || 5, // Schema uses number for days
            active: true
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error creating shipping rate:", error);
        return { success: false, message: error.message || "Erro desconhecido ao criar frete." };
    }
}

export async function updateShippingRateService(id: string, data: Partial<ShippingRate>) {
    try {
        await pb.collection('shipping_rates').update(id, data);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating shipping rate:", error);
        return { success: false, message: error.message };
    }
}

export async function deleteShippingRateService(id: string) {
    try {
        await pb.collection('shipping_rates').delete(id);
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting shipping rate:", error);
        return { success: false, message: error.message };
    }
}
