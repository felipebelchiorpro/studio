
"use client";

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockOrders as initialOrders } from "@/data/mockData";
import type { Order } from "@/types";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

import { fetchOrdersService } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { translateOrderStatus } from '@/lib/utils/orderStatus';

const ITEMS_PER_PAGE = 10;

export default function SalesReportPage() {
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
      case 'delivered': return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50';
      case 'sent': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/50';
    }
  };


  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="font-headline text-2xl sm:text-3xl font-bold text-foreground">Relatório de Vendas</h1>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center p-3 sm:p-4 bg-card rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Buscar por ID do pedido ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-full sm:max-w-xs text-sm sm:text-base"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] text-sm sm:text-base">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
          <Download className="mr-2 h-4 w-4" /> Exportar CSV (Simulado)
        </Button>
      </div>

      <div className="bg-card p-0 rounded-lg shadow-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-2 py-3 sm:px-4">ID Pedido</TableHead>
              <TableHead className="px-2 py-3 sm:px-4">Data</TableHead>
              <TableHead className="hidden md:table-cell px-2 py-3 sm:px-4">Usuário ID</TableHead>
              <TableHead className="text-right px-2 py-3 sm:px-4">Valor Total</TableHead>
              <TableHead className="text-center px-2 py-3 sm:px-4">Status</TableHead>
              <TableHead className="text-center hidden sm:table-cell px-2 py-3 sm:px-4">Itens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Carregando pedidos reais...
                </TableCell>
              </TableRow>
            ) : paginatedOrders.length > 0 ? paginatedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium px-2 py-3 sm:px-4 text-xs sm:text-sm">#{order.id.substring(0, 8)}...</TableCell>
                <TableCell className="px-2 py-3 sm:px-4 text-xs sm:text-sm">{new Date(order.orderDate).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="hidden md:table-cell px-2 py-3 sm:px-4 text-xs sm:text-sm">{order.userId}</TableCell>
                <TableCell className="text-right px-2 py-3 sm:px-4 text-xs sm:text-sm">R$ {order.totalAmount.toFixed(2).replace('.', ',')}</TableCell>
                <TableCell className="text-center px-2 py-3 sm:px-4">
                  <Badge variant="outline" className={`text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 ${getStatusColorClass(order.status)}`}>
                    {translateOrderStatus(order.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell px-2 py-3 sm:px-4 text-xs sm:text-sm">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm sm:text-base">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-1 sm:space-x-2 mt-4 sm:mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="text-xs sm:text-sm"
          >
            Anterior
          </Button>
          <span className="text-xs sm:text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="text-xs sm:text-sm"
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

