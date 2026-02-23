
"use client";

import { useEffect, useState } from 'react';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { translateOrderStatus } from '@/lib/utils/orderStatus';

interface OrderListProps {
    orders: Order[];
    loading?: boolean;
}



export function OrderList({ orders, loading }: OrderListProps) {

    if (loading) {
        return <div className="text-center py-8">Carregando pedidos...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12 bg-neutral-900/50 rounded-lg border border-neutral-800">
                <p className="text-muted-foreground mb-4">Você ainda não fez nenhum pedido.</p>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Ir para a Loja
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => {
                const getStatusColor = (status: string) => {
                    switch (status?.toLowerCase()) {
                        case 'pending': return 'bg-yellow-500/20 text-yellow-500';
                        case 'paid': return 'bg-blue-500/20 text-blue-500';
                        case 'packing': return 'bg-purple-500/20 text-purple-500';
                        case 'sent':
                        case 'shipped': return 'bg-blue-500/20 text-blue-500';
                        case 'delivered': return 'bg-green-500/20 text-green-500';
                        case 'cancelled': return 'bg-red-500/20 text-red-500';
                        default: return 'bg-gray-500/20 text-gray-500';
                    }
                };

                const translatedStatus = translateOrderStatus(order.status);
                const statusColor = getStatusColor(order.status);

                return (
                    <Card key={order.id} className="overflow-hidden border-neutral-800 bg-neutral-900/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-neutral-900/50">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-medium">Pedido #{order.id.slice(0, 8)}</CardTitle>
                                <CardDescription>
                                    {format(new Date(order.orderDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </CardDescription>
                            </div>
                            <Badge className={`${statusColor} border-0`}>{translatedStatus}</Badge>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-2">
                                {order.items.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-400">{item.quantity}x {item.name}</span>
                                        <span>R$ {Number(item.price).toFixed(2)}</span>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <p className="text-xs text-gray-500 italic">+ {order.items.length - 3} itens</p>
                                )}

                                <div className="border-t border-neutral-800 mt-4 pt-4 flex justify-between items-center">
                                    <span className="font-semibold text-gray-300">Total</span>
                                    <span className="font-bold text-lg text-white">R$ {order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
