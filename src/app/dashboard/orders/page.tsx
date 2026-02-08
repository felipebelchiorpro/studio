"use client";

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

import { fetchOrdersService } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();

    React.useEffect(() => {
        const loadOrders = async () => {
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
        };
        loadOrders();
    }, [toast]);

    const filteredOrders = orders
        .filter(order => {
            const searchMatch = (order.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.userId || "").toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter === "all" || order.status === statusFilter;
            return searchMatch && statusMatch;
        })
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    const getStatusColorClass = (status: Order['status']): string => {
        switch (status) {
            case 'Delivered': return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50';
            case 'Shipped': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/50';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50';
            case 'Cancelled': return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50';
            case 'Confirmed': return 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/50';
            case 'Packing': return 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/50';
            default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/50';
        }
    };


    return (
        <div className="space-y-4 sm:space-y-6">
            <h1 className="font-headline text-2xl sm:text-3xl font-bold text-foreground">Gerenciar Pedidos</h1>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center p-3 sm:p-4 bg-card rounded-lg shadow">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Input
                        type="text"
                        placeholder="Buscar por ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-full sm:max-w-xs text-sm sm:text-base"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] text-sm sm:text-base">
                            <SelectValue placeholder="Filtrar por status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="Pending">Pendente</SelectItem>
                            <SelectItem value="Confirmed">Confirmado</SelectItem>
                            <SelectItem value="Packing">Embalando</SelectItem>
                            <SelectItem value="Shipped">Enviado</SelectItem>
                            <SelectItem value="Delivered">Entregue</SelectItem>
                            <SelectItem value="Cancelled">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-card p-0 rounded-lg shadow-md overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-2 py-3 sm:px-4">ID</TableHead>
                            <TableHead className="px-2 py-3 sm:px-4">Data</TableHead>
                            <TableHead className="text-right px-2 py-3 sm:px-4">Total</TableHead>
                            <TableHead className="text-center px-2 py-3 sm:px-4">Status</TableHead>
                            <TableHead className="text-center px-2 py-3 sm:px-4">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Carregando pedidos...
                                </TableCell>
                            </TableRow>
                        ) : paginatedOrders.length > 0 ? paginatedOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium px-2 py-3 sm:px-4 text-xs sm:text-sm">#{order.id.substring(0, 8)}</TableCell>
                                <TableCell className="px-2 py-3 sm:px-4 text-xs sm:text-sm">{new Date(order.orderDate).toLocaleDateString('pt-BR')}</TableCell>
                                <TableCell className="text-right px-2 py-3 sm:px-4 text-xs sm:text-sm">R$ {order.totalAmount.toFixed(2).replace('.', ',')}</TableCell>
                                <TableCell className="text-center px-2 py-3 sm:px-4">
                                    <Badge variant="outline" className={`text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 ${getStatusColorClass(order.status)}`}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center px-2 py-3 sm:px-4">
                                    <Link href={`/dashboard/orders/${order.id}`}>
                                        <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm sm:text-base">
                                    Nenhum pedido encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
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
