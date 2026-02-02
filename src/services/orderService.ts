
import { supabase } from '@/lib/supabaseClient';
import { Order, CartItem } from '@/types';

export const fetchOrdersService = async (): Promise<Order[]> => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (*)
                )
            `)
            .order('order_date', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }

        return (data || []).map((dbOrder: any) => {
            const items: CartItem[] = (dbOrder.order_items || []).map((item: any) => {
                const product = item.products;
                return {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: Number(product.price),
                    originalPrice: product.original_price ? Number(product.original_price) : undefined,
                    category: product.category || '',
                    brand: product.brand || '',
                    imageUrl: product.image_url,
                    stock: product.stock,
                    quantity: item.quantity,
                    // Map other product properties if needed
                } as CartItem;
            });

            return {
                id: dbOrder.id,
                userId: dbOrder.user_id,
                items,
                totalAmount: Number(dbOrder.total_amount),
                orderDate: dbOrder.order_date,
                status: dbOrder.status as Order['status'],
                shippingAddress: dbOrder.shipping_address,
                channel: dbOrder.channel,
                userPhone: dbOrder.user_phone
            };
        });
    } catch (err) {
        console.error('Service error fetching orders:', err);
        return [];
    }
};
