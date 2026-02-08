"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Save, MessageSquare } from 'lucide-react';

import { fetchOrderByIdService } from '@/services/orderService';
import { updateOrderStatusAction } from '@/actions/order';
import type { Order } from '@/types';
import Link from 'next/link';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState<string>("");

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        setLoading(true);
        const data = await fetchOrderByIdService(id);
        if (data) {
            setOrder(data);
            setStatus(data.status);
        } else {
            toast({
                title: "Erro",
                description: "Pedido não encontrado.",
                variant: 'destructive'
            });
            router.push('/dashboard/orders');
        }
        setLoading(false);
    };

    const handleUpdateStatus = async () => {
        if (!order) return;
        setUpdating(true);

        const result = await updateOrderStatusAction(order.id, status);

        if (result.success) {
            toast({
                title: "Status Atualizado",
                description: "Pedido atualizado com sucesso.",
                variant: 'default'
            });
            // Update local state is manual since we didn't refetch
            setOrder(prev => prev ? { ...prev, status: status as any } : null);
        } else {
            toast({
                title: "Erro ao atualizar",
                description: result.message || "Tente novamente.",
                variant: 'destructive'
            });
        }
        setUpdating(false);
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!order) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/orders">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pedido #{order.id.slice(0, 8)}</h1>
                    <p className="text-muted-foreground text-sm">{new Date(order.orderDate).toLocaleString('pt-BR')}</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Badge variant="outline" className="text-base px-3 py-1 capitalize">
                        {order.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Items and Totals */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Itens do Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex gap-4 items-center">
                                        <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                            IMG
                                        </div>
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">{item.quantity}x R$ {Number(item.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium">R$ {(item.quantity * Number(item.price)).toFixed(2)}</p>
                                </div>
                            ))}

                            <Separator className="my-4" />

                            <div className="flex justify-between pt-2">
                                <span>Subtotal</span>
                                <span>R$ {order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-2 font-bold text-lg">
                                <span>Total</span>
                                <span>R$ {order.totalAmount.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer & Delivery Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações de Entrega</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="font-semibold text-muted-foreground">Cliente:</div>
                                <div className="col-span-2">{order.userId === 'guest' ? 'Convidado' : order.userId}</div>

                                <div className="font-semibold text-muted-foreground">Telefone:</div>
                                <div className="col-span-2">{order.userPhone || 'Não informado'}</div>

                                <div className="font-semibold text-muted-foreground">Endereço:</div>
                                <div className="col-span-2">
                                    {(order.shippingAddress as any)?.city || 'Não informado'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6">
                    <Card className="border-blue-500/20 shadow-lg">
                        <CardHeader className="bg-blue-50/10 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-500" />
                                Atualizar Status
                            </CardTitle>
                            <CardDescription>
                                Isso irá disparar notificações automáticas para o cliente.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Novo Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pendente</SelectItem>
                                        <SelectItem value="Confirmed">Confirmado (Aprovado)</SelectItem>
                                        <SelectItem value="Packing">Embalando (Separação)</SelectItem>
                                        <SelectItem value="Delivered">Entregue / Pronto (Saiu)</SelectItem>
                                        <SelectItem value="Cancelled">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={handleUpdateStatus} disabled={updating || status === order.status} className="w-full">
                                {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Salvar & Notificar
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
