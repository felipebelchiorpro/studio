'use server';

import { getPocketBaseAdmin } from '@/lib/pocketbaseAdmin';
import { Order, CartItem } from '@/types';
import { pb } from '@/lib/pocketbase'; // Keep for other functions if needed

export const fetchOrdersService = async (): Promise<Order[]> => {
    try {
        const pbAdmin = await getPocketBaseAdmin();
        const records = await pbAdmin.collection('orders').getFullList({
            expand: 'user',
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

            let parsedShipping = record.shipping_address;
            if (typeof parsedShipping === 'string') {
                try { parsedShipping = JSON.parse(parsedShipping); } catch (e) { }
            }

            return {
                id: record.id,
                userId: record.user,
                userName: record.expand?.user?.name || parsedShipping?.customerName || record.expand?.user?.email || parsedShipping?.customerEmail || 'Convidado',
                userEmail: record.expand?.user?.email || parsedShipping?.customerEmail,
                items,
                totalAmount: record.total,
                orderDate: record.created || record.updated || new Date().toISOString(),
                status: record.status as Order['status'],
                shippingAddress: parsedShipping,
                channel: record.channel || 'ecommerce',
                userPhone: record.user_phone || record.expand?.user?.phone || parsedShipping?.customerPhone || ''
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
            expand: 'user',
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

            let parsedShipping = record.shipping_address;
            if (typeof parsedShipping === 'string') {
                try { parsedShipping = JSON.parse(parsedShipping); } catch (e) { }
            }

            return {
                id: record.id,
                userId: record.user,
                userName: record.expand?.user?.name || parsedShipping?.customerName || record.expand?.user?.email || parsedShipping?.customerEmail || 'Convidado',
                userEmail: record.expand?.user?.email || parsedShipping?.customerEmail,
                items,
                totalAmount: record.total,
                orderDate: record.created || record.updated || new Date().toISOString(),
                status: record.status as Order['status'],
                shippingAddress: parsedShipping,
                channel: record.channel || 'ecommerce',
                userPhone: record.user_phone || record.expand?.user?.phone || parsedShipping?.customerPhone || ''
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
        const record = await pbAdmin.collection('orders').getOne(id, {
            expand: 'user',
        });

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

        let parsedShipping = record.shipping_address;
        if (typeof parsedShipping === 'string') {
            try { parsedShipping = JSON.parse(parsedShipping); } catch (e) { }
        }

        return {
            id: record.id,
            userId: record.user,
            userName: record.expand?.user?.name || parsedShipping?.customerName || record.expand?.user?.email || parsedShipping?.customerEmail || 'Convidado',
            userEmail: record.expand?.user?.email || parsedShipping?.customerEmail,
            items,
            totalAmount: record.total,
            orderDate: record.created || record.updated || new Date().toISOString(),
            status: record.status as Order['status'],
            shippingAddress: parsedShipping,
            channel: record.channel,
            userPhone: record.user_phone || record.expand?.user?.phone || parsedShipping?.customerPhone || ''
        };
    } catch (err) {
        console.error('Service error fetching order by ID:', err);
        return null;
    }
};
