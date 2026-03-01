"use client";

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, Loader2, Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';

import { fetchOrdersService } from '@/services/orderService';
import { createOrderAction } from '@/actions/order';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 10;

import { translateOrderStatus } from '@/lib/utils/orderStatus';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [activeTab, setActiveTab] = useState<string>("active");
    const [currentPage, setCurrentPage] = useState(1);
    const [isSimulating, setIsSimulating] = useState(false);
    const { toast } = useToast();

    const loadOrders = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchOrdersService();
            setOrders(data);
        } catch (error) {
            console.error("Failed to load orders", error);
            toast({
                title: "Erro ao carregar pedidos",
                description: "Não foi possível conectar ao banco de dados.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleSimulateOrder = async () => {
        setIsSimulating(true);
        try {
            const mockItems = [{
                id: "mock-item-" + Date.now(),
                productId: "mock-product-1",
                name: "Produto Simulado (Teste)",
                price: 99.90,
                quantity: 1,
                imageUrl: "",
            }];

            const result = await createOrderAction({
                userId: "",
                items: mockItems as any,
                totalAmount: 99.90,
                paymentId: "simulated_" + Date.now(),
                status: "Pending",
                shippingAddress: {
                    street: "Rua Fictícia",
                    number: "123",
                    city: "São Paulo",
                    state: "SP",
                    cep: "00000-000",
                    neighborhood: "Centro"
                },
                shippingFee: 0,
                userEmail: "contato@darkstoresuplementos.com",
                userPhone: "5519971120949",
                channel: "dashboard_simulacao"
            });

            if (result.success) {
                toast({ title: "Sucesso!", description: "Pedido simulado criado com sucesso." });
                loadOrders(); // Atualiza a lista
            } else {
                toast({ title: "Erro na simulação", description: result.message || "Falha ao criar pedido", variant: "destructive" });
            }
        } catch (e: any) {
            toast({ title: "Erro", description: e.message, variant: "destructive" });
        } finally {
            setIsSimulating(false);
        }
    };

    const filteredOrders = orders
        .filter(order => {
            const searchMatch = (order.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.userName || "").toLowerCase().includes(searchTerm.toLowerCase());

            // Tab Logic
            const isArchived = order.status === 'delivered' || order.status === 'cancelled';
            const tabMatch = activeTab === 'archived' ? isArchived : !isArchived;

            const statusMatch = statusFilter === "all" || order.status === statusFilter;
            return searchMatch && statusMatch && tabMatch;
        })
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    // Counters
    const activeCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
    const archivedCount = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled').length;

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    const getStatusColorClass = (status: Order['status']): string => {
        switch (status) {
            case 'delivered': return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50';
            case 'sent': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/50';
            case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50';
            case 'cancelled': return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50';
            case 'paid': return 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/50';
            case 'packing': return 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/50';
            default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/50';
        }
    };


    return (
        <div className="space-y-4 sm:space-y-6">
            <h1 className="font-headline text-2xl sm:text-3xl font-bold text-foreground">Gerenciar Pedidos</h1>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center p-3 sm:p-4 bg-card rounded-lg shadow">
                <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full items-center justify-between border-b sm:border-b-0 pb-3 sm:pb-0 border-border/40">
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Input
                            type="text"
                            placeholder="Buscar por ID ou Cliente..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="max-w-full sm:max-w-xs text-sm sm:text-base"
                        />
                        <Select value={statusFilter} onValueChange={(val) => {
                            setStatusFilter(val);
                            setCurrentPage(1);
                        }}>
                            <SelectTrigger className="w-full sm:w-[180px] text-sm sm:text-base">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Status</SelectItem>
                                {activeTab === 'active' ? (
                                    <>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="paid">Pago</SelectItem>
                                        <SelectItem value="packing">Embalando</SelectItem>
                                        <SelectItem value="sent">Enviado</SelectItem>
                                    </>
                                ) : (
                                    <>
                                        <SelectItem value="delivered">Entregue</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSimulateOrder} disabled={isSimulating} variant="default" className="w-full sm:w-auto mt-2 sm:mt-0 whitespace-nowrap bg-primary text-primary-foreground">
                        {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Simular Pedido
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(val) => {
                setActiveTab(val);
                setStatusFilter("all");
                setCurrentPage(1);
            }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="active" className="relative">
                        Em Andamento
                        {activeCount > 0 && (
                            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                {activeCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="archived">
                        Arquivados
                        {archivedCount > 0 && (
                            <Badge variant="outline" className="ml-2 text-muted-foreground">
                                {archivedCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-0">
                    <div className="bg-card p-0 rounded-lg shadow-md overflow-x-auto ring-1 ring-border">
                        <TableContent
                            loading={loading}
                            orders={paginatedOrders}
                            getStatusColorClass={getStatusColorClass}
                            toast={toast}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="archived" className="mt-0">
                    <div className="bg-card p-0 rounded-lg shadow-md overflow-x-auto ring-1 ring-border">
                        <TableContent
                            loading={loading}
                            orders={paginatedOrders}
                            getStatusColorClass={getStatusColorClass}
                            toast={toast}
                        />
                    </div>
                </TabsContent>
            </Tabs>
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-1 sm:space-x-2 mt-4 sm:mt-6">
                    {/* Pagination Controls */}
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</Button>
                    <span className="text-sm">Página {currentPage} de {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Próxima</Button>
                </div>
            )}
        </div>
    );
}

function TableContent({ loading, orders, getStatusColorClass, toast }: any) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="px-2 py-3 sm:px-4 text-xs font-bold uppercase tracking-wider">ID</TableHead>
                    <TableHead className="px-2 py-3 sm:px-4 text-xs font-bold uppercase tracking-wider">Cliente</TableHead>
                    <TableHead className="px-2 py-3 sm:px-4 text-xs font-bold uppercase tracking-wider">Data</TableHead>
                    <TableHead className="text-right px-2 py-3 sm:px-4 text-xs font-bold uppercase tracking-wider">Total</TableHead>
                    <TableHead className="text-center px-2 py-3 sm:px-4 text-xs font-bold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-center px-2 py-3 sm:px-4 text-xs font-bold uppercase tracking-wider">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Carregando pedidos...
                            </div>
                        </TableCell>
                    </TableRow>
                ) : orders.length > 0 ? orders.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-mono px-2 py-3 sm:px-4 text-[10px] sm:text-xs">#{order.id.substring(0, 8)}</TableCell>
                        <TableCell className="px-2 py-3 sm:px-4 text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate" title={order.userName}>
                            <div className="font-semibold">{order.userName || 'Visitante'}</div>
                            <div className="text-[10px] text-muted-foreground hidden sm:block">{order.userPhone || 'Sem telefone'}</div>
                        </TableCell>
                        <TableCell className="px-2 py-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                            {(() => {
                                try {
                                    const d = new Date(order.orderDate);
                                    return isNaN(d.getTime()) ? 'Indisponível' : d.toLocaleDateString('pt-BR');
                                } catch {
                                    return 'Indisponível';
                                }
                            })()}
                        </TableCell>
                        <TableCell className="text-right px-2 py-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap">R$ {order.totalAmount.toFixed(2).replace('.', ',')}</TableCell>
                        <TableCell className="text-center px-2 py-3 sm:px-4">
                            <Badge variant="outline" className={`text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 ${getStatusColorClass(order.status)} whitespace-nowrap`}>
                                {translateOrderStatus(order.status)}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-center px-2 py-3 sm:px-4">
                            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                                {order.status === 'pending' && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        title="Remarketing no WhatsApp"
                                        className="h-7 w-7 sm:h-8 sm:w-8 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-900/40"
                                        onClick={() => {
                                            const phone = order.userPhone || "";
                                            const cleanPhone = phone.replace(/\D/g, '');
                                            if (!cleanPhone) {
                                                toast({ title: "Erro", description: "Telefone do cliente não encontrado.", variant: "destructive" });
                                                return;
                                            }
                                            const msg = `Olá, tudo bem? Notamos que você iniciou o pedido #${order.id.substring(0, 8)} na Dark Store Suplementos, mas o pagamento ficou pendente. 🛒\n\nFicou com alguma dúvida ou teve algum problema na hora de pagar? Me avisa aqui que te ajudo a finalizar! 💪`;
                                            const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
                                            window.open(url, '_blank');
                                        }}
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                    </Button>
                                )}
                                <Link href={`/dashboard/orders/${order.id}`}>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" title="Ver detalhes">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-sm">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="p-3 bg-muted rounded-full">
                                    <Eye className="h-6 w-6 opacity-20" />
                                </div>
                                <span>Nenhum pedido encontrado nesta categoria.</span>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
