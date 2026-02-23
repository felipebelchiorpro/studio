import { NextResponse } from 'next/server';
import { fetchOrdersService } from '@/services/orderService';

export async function GET() {
    try {
        const orders = await fetchOrdersService();
        return NextResponse.json({ success: true, count: orders.length, orders });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
