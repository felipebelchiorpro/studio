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
            sort: 'base_fee',
            filter: 'is_active=true'
        });

        return records.map((r: any) => ({
            id: r.id,
            city_name: r.city_name,
            base_fee: r.base_fee,
            estimated_delivery_time: r.estimated_delivery_time,
            is_active: r.is_active,
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
            city_name: data.city_name,
            base_fee: data.base_fee,
            estimated_delivery_time: data.estimated_delivery_time,
            is_active: true
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error creating shipping rate:", error);
        return { success: false, message: error.message };
    }
}

export async function updateShippingRate(id: string, data: Partial<ShippingRate>) {
    try {
        await pb.collection('shipping_rates').update(id, data);
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
