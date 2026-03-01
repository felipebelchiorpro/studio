"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Save, MessageSquare, Calendar, User, Phone, MapPin, MessageCircle, RefreshCw, PenSquare, CreditCard } from 'lucide-react';

import { fetchOrderByIdService } from '@/services/orderService';
import { updateOrderStatusAction, updateOrderTrackingCodeAction, updateCustomerDetailsAction } from '@/actions/order';
import { checkPaymentStatusByOrderId } from '@/actions/mercadopago';
import { translateOrderStatus } from '@/lib/utils/orderStatus';
import type { Order } from '@/types';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [trackingCode, setTrackingCode] = useState<string>("");

    const [verifyingPayment, setVerifyingPayment] = useState(false);

    // Edit Dialog States
    const [editOpen, setEditOpen] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editEmail, setEditEmail] = useState("");

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        setLoading(true);
        const data = await fetchOrderByIdService(id);
        if (data) {
            setOrder(data);
            setStatus(data.status);
            setTrackingCode(data.trackingCode || "");

            setEditName(data.userName || "");
            setEditPhone(data.userPhone || "");
            setEditEmail(data.userEmail || "");
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

        // First, check if there's a need to update tracking code explicitly if it changed
        if (trackingCode !== (order.trackingCode || '')) {
            await updateOrderTrackingCodeAction(order.id, trackingCode);
        }

        const result = await updateOrderStatusAction(order.id, status);

        if (result.success) {
            toast({
                title: "Sucesso",
                description: "Pedido atualizado com sucesso e cliente notificado via WhatsApp.",
                variant: 'default'
            });
            setOrder(prev => prev ? { ...prev, status: status as any, trackingCode } : null);
        } else {
            toast({
                title: "Erro ao atualizar",
                description: result.message || "Tente novamente.",
                variant: 'destructive'
            });
        }
        setUpdating(false);
    };

    const handleVerifyPayment = async () => {
        if (!order) return;
        setVerifyingPayment(true);
        const res = await checkPaymentStatusByOrderId(order.id);

        if (res.success) {
            toast({
                title: res.updateTo === 'paid' ? "Pagamento Aprovado!" : "Verificação Concluída",
                description: res.message,
                variant: 'default'
            });
            if (res.updateTo) {
                setOrder(prev => prev ? { ...prev, status: res.updateTo as any } : null);
                setStatus(res.updateTo);
            }
        } else {
            toast({
                title: "Falha na Verificação",
                description: res.message,
                variant: 'destructive'
            });
        }
        setVerifyingPayment(false);
    };

    const handleSaveCustomerDetails = async () => {
        if (!order) return;
        setEditSaving(true);
        const res = await updateCustomerDetailsAction(order.id, {
            userName: editName,
            userEmail: editEmail,
            userPhone: editPhone,
        });

        if (res.success) {
            toast({ title: "Sucesso", description: "Dados atualizados." });
            setOrder(prev => prev ? { ...prev, userName: editName, userEmail: editEmail, userPhone: editPhone } : null);
            setEditOpen(false);
        } else {
            toast({ title: "Erro", description: res.message, variant: 'destructive' });
        }
        setEditSaving(false);
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
                    <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {(() => {
                            try {
                                const d = new Date(order.orderDate);
                                return isNaN(d.getTime()) ? 'Data Indisponível' : d.toLocaleString('pt-BR');
                            } catch {
                                return 'Data Indisponível';
                            }
                        })()}
                    </p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Badge variant="outline" className="text-base px-3 py-1 capitalize">
                        {translateOrderStatus(order.status)}
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
                                        {item.imageUrl ? (
                                            <div className="h-12 w-12 rounded overflow-hidden bg-white border border-border/50 flex-shrink-0">
                                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                                                IMG
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <div className="text-xs text-muted-foreground space-y-0.5 mt-0.5">
                                                <p>{item.quantity}x R$ {Number(item.price).toFixed(2).replace('.', ',')}</p>
                                                {item.selectedFlavor && <p>Sabor: {item.selectedFlavor}</p>}
                                                {item.selectedSize && <p>Tamanho: {item.selectedSize}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-medium whitespace-nowrap">R$ {(item.quantity * Number(item.price)).toFixed(2).replace('.', ',')}</p>
                                </div>
                            ))}

                            <Separator className="my-4" />

                            <div className="flex justify-between pt-2">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>R$ {order.totalAmount.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between pt-2 font-bold text-lg">
                                <span>Total</span>
                                <span>R$ {order.totalAmount.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer & Delivery Info */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle>Dados do Cliente e Entrega</CardTitle>
                            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-neutral-800">
                                        <PenSquare className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Editar Dados do Cliente</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm">Nome do Cliente</label>
                                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm">Email</label>
                                            <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm">Telefone / WhatsApp</label>
                                            <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>Cancelar</Button>
                                        <Button onClick={handleSaveCustomerDetails} disabled={editSaving}>
                                            {editSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salvar
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

                                <div className="space-y-1">
                                    <div className="font-medium flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> Cliente</div>
                                    <div>{order.userName || 'Nome não registrado'}</div>
                                    {order.userEmail && <div className="text-muted-foreground text-xs">{order.userEmail}</div>}
                                </div>

                                <div className="space-y-1">
                                    <div className="font-medium flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> Contato</div>
                                    <div>{order.userPhone || 'Telefone não informado'}</div>
                                    {order.userPhone && (
                                        <a
                                            href={`https://wa.me/${order.userPhone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-1"
                                        >
                                            <MessageCircle className="h-3 w-3" /> Falar no WhatsApp
                                        </a>
                                    )}
                                </div>

                                <div className="sm:col-span-2 space-y-1 pt-2 border-t">
                                    <div className="font-medium flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Endereço de Entrega</div>
                                    <div className="text-muted-foreground">
                                        {(() => {
                                            const addr = order.shippingAddress;
                                            if (!addr) return 'Endereço não informado';
                                            if (typeof addr === 'string') return addr;
                                            if (typeof addr === 'object') {
                                                if (addr.type === 'pickup') return <span className="font-medium text-primary">Retirada na Loja Física</span>;
                                                return `${addr.street || ''}, ${addr.number || 'S/N'}${addr.complement ? ` - ${addr.complement}` : ''} - ${addr.neighborhood || ''} - ${addr.city || ''}/${addr.state || ''} - CEP: ${addr.cep || addr.zipCode || ''}`;
                                            }
                                            return 'Formato de endereço inválido';
                                        })()}
                                    </div>
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
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="paid">Confirmado (Aprovado)</SelectItem>
                                        <SelectItem value="packing">Embalando (Separação)</SelectItem>
                                        <SelectItem value="sent">Enviado (Em trânsito)</SelectItem>
                                        <SelectItem value="delivered">Entregue / Pronto</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {status === 'sent' && (
                                <div className="space-y-2 pt-2">
                                    <label className="text-sm font-medium">Código de Rastreio (Opcional)</label>
                                    <Input
                                        placeholder="Ex: BR123456789BR"
                                        value={trackingCode}
                                        onChange={(e) => setTrackingCode(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Insira o código antes de salvar para incluí-lo na mensagem do cliente.</p>
                                </div>
                            )}

                            <Button onClick={handleUpdateStatus} disabled={updating || (status === order.status && trackingCode === (order.trackingCode || ''))} className="w-full">
                                {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Salvar & Notificar
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-green-500/20 shadow-lg">
                        <CardHeader className="bg-green-50/10 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2 text-green-500">
                                <CreditCard className="h-5 w-5" />
                                Mercado Pago
                            </CardTitle>
                            <CardDescription>
                                Verifique se o cliente concluiu o pagamento do pedido via Mercado Pago.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Button
                                onClick={handleVerifyPayment}
                                disabled={verifyingPayment || order.status === 'paid' || order.status === 'cancelled'}
                                variant="outline"
                                className="w-full border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                            >
                                {verifyingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                Verificar Pagamento
                            </Button>
                            {order.status === 'paid' && (
                                <p className="text-sm text-center text-muted-foreground mt-3">✅ Pedido já está pago.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
