'use server';

import { getPocketBaseAdmin } from '@/lib/pocketbaseAdmin';
import { Order, CartItem } from '@/types';
import { pb } from '@/lib/pocketbase'; // Keep for other functions if needed

export const fetchOrdersService = async (): Promise<Order[]> => {
    try {
        const pbAdmin = await getPocketBaseAdmin();
        const records = await pbAdmin.collection('orders').getFullList();

        return records.map((record: any) => {
            let rawItems = record.items || [];
            if (typeof rawItems === 'string') {
                try { rawItems = JSON.parse(rawItems); } catch (e) { rawItems = []; }
            }
            if (!Array.isArray(rawItems)) rawItems = [];

            const items: CartItem[] = rawItems.map((item: any) => ({
                id: item.id || item.product_id || 'unknown',
                name: item.name || 'Desconhecido',
                description: item.description || '',
                price: Number(item.price || 0),
                quantity: item.quantity || 1,
                imageUrl: item.image || item.imageUrl || '',
            }));

            return {
                id: record.id,
                userId: record.user,
                items,
                totalAmount: record.total,
                orderDate: record.created,
                status: record.status as Order['status'], // Ensure case matches
                shippingAddress: record.shipping_address, // JSON or String?
                channel: record.channel || 'ecommerce',
                userPhone: record.user_phone // Need to fetch from user or if stored in order?
                // Note: user_phone isn't in my schema update for orders, but might be in shipping_address
            };
        });
    } catch (err) {
        console.error('Service error fetching orders:', err);
        return [];
    }
};

export const fetchMyOrdersService = async (userId: string): Promise<Order[]> => {
    try {
        const pbAdmin = await getPocketBaseAdmin();
        const records = await pbAdmin.collection('orders').getFullList({
            filter: `user = "${userId}"`,
        });

        return records.map((record: any) => {
            let rawItems = record.items || [];
            if (typeof rawItems === 'string') {
                try { rawItems = JSON.parse(rawItems); } catch (e) { rawItems = []; }
            }
            if (!Array.isArray(rawItems)) rawItems = [];

            const items: CartItem[] = rawItems.map((item: any) => ({
                id: item.id || item.product_id || 'unknown',
                name: item.name || 'Desconhecido',
                description: item.description || '',
                price: Number(item.price || 0),
                quantity: item.quantity || 1,
                imageUrl: item.image || item.imageUrl || '',
            }));

            return {
                id: record.id,
                userId: record.user,
                items,
                totalAmount: record.total,
                orderDate: record.created,
                status: record.status as Order['status'],
                shippingAddress: record.shipping_address,
                channel: record.channel || 'ecommerce',
                userPhone: record.user_phone
            };
        });
    } catch (err) {
        console.error('Service error fetching my orders:', err);
        return [];
    }
};

export const fetchOrderByIdService = async (id: string): Promise<Order | null> => {
    try {
        const pbAdmin = await getPocketBaseAdmin();
        const record = await pbAdmin.collection('orders').getOne(id);

        let rawItems = record.items || [];
        if (typeof rawItems === 'string') {
            try { rawItems = JSON.parse(rawItems); } catch (e) { rawItems = []; }
        }
        if (!Array.isArray(rawItems)) rawItems = [];

        const items: CartItem[] = rawItems.map((item: any) => ({
            id: item.id || item.product_id || 'unknown',
            name: item.name || 'Desconhecido',
            description: item.description || '',
            price: Number(item.price || 0),
            quantity: item.quantity || 1,
            imageUrl: item.image || item.imageUrl || '',
        }));

        return {
            id: record.id,
            userId: record.user,
            items,
            totalAmount: record.total,
            orderDate: record.created,
            status: record.status as Order['status'],
            shippingAddress: record.shipping_address,
            channel: record.channel,
            userPhone: record.user_phone
        };
    } catch (err) {
        console.error('Service error fetching order by ID:', err);
        return null;
    }
};
