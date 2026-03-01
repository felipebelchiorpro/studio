'use server';

import { pb } from "@/lib/pocketbase";

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
        const records = await pb.collection('shipping_rates').getFullList({
            sort: 'price',
            filter: 'active=true'
        });

        return records.map((r: any) => ({
            id: r.id,
            city_name: r.city,
            base_fee: r.price,
            estimated_delivery_time: `${r.delivery_days} dias úteis`,
            is_active: r.active,
            created_at: r.created
        })) as ShippingRate[];
    } catch (err) {
        console.warn("Exception fetching shipping rates:", err);
        return [];
    }
}

export async function createShippingRate(data: Omit<ShippingRate, 'id' | 'is_active' | 'created_at'>) {
    try {
        await pb.collection('shipping_rates').create({
            city: data.city_name,
            price: data.base_fee,
            delivery_days: parseInt(data.estimated_delivery_time) || 1,
            active: true
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error creating shipping rate:", error);
        return { success: false, message: error.message };
    }
}

export async function updateShippingRate(id: string, data: Partial<ShippingRate>) {
    try {
        const mappedData: any = {};
        if (data.city_name !== undefined) mappedData.city = data.city_name;
        if (data.base_fee !== undefined) mappedData.price = data.base_fee;
        if (data.estimated_delivery_time !== undefined) mappedData.delivery_days = parseInt(data.estimated_delivery_time) || 1;
        if (data.is_active !== undefined) mappedData.active = data.is_active;

        await pb.collection('shipping_rates').update(id, mappedData);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating shipping rate:", error);
        return { success: false, message: error.message };
    }
}

export async function deleteShippingRate(id: string) {
    try {
        await pb.collection('shipping_rates').delete(id);
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting shipping rate:", error);
        return { success: false, message: error.message };
    }
}
