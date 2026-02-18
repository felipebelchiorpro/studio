
import { pb } from '@/lib/pocketbase';
import { Order, CartItem } from '@/types';

export const fetchOrdersService = async (): Promise<Order[]> => {
    try {
        const records = await pb.collection('orders').getFullList({
            sort: '-created',
        });

        return records.map((record: any) => {
            const items: CartItem[] = (record.items || []).map((item: any) => ({
                id: item.id || item.product_id, // Fallback
                name: item.name,
                description: item.description || '',
                price: Number(item.price),
                quantity: item.quantity,
                imageUrl: item.image || item.imageUrl || '',
                // ... map other fields if present in JSON
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
        const records = await pb.collection('orders').getFullList({
            filter: `user = "${userId}"`,
            sort: '-created',
        });

        return records.map((record: any) => {
            const items: CartItem[] = (record.items || []).map((item: any) => ({
                id: item.id || item.product_id,
                name: item.name,
                description: item.description || '',
                price: Number(item.price),
                quantity: item.quantity,
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
        const record = await pb.collection('orders').getOne(id);

        const items: CartItem[] = (record.items || []).map((item: any) => ({
            id: item.id || item.product_id,
            name: item.name,
            description: item.description || '',
            price: Number(item.price),
            quantity: item.quantity,
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
