
"use client";

import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderList } from '@/components/dashboard/OrderList';
import { AddressList } from '@/components/dashboard/AddressList';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import { fetchMyOrdersService } from '@/services/orderService';
import { getCurrentUserService } from '@/services/userService';
import { Order, CustomerUser } from '@/types';
import { Package, MapPin, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function CustomerDashboardPage() {
  const { customer, isCustomerAuthenticated, customerAuthLoading, customerLogout } = useCustomerAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [userData, setUserData] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!customer?.id) return;

    setLoading(true);
    try {
      const [ordersRes, userRes] = await Promise.all([
        fetchMyOrdersService(customer.id),
        getCurrentUserService()
      ]);
      setOrders(ordersRes);
      setUserData(userRes);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [customer?.id]);

  useEffect(() => {
    if (!customerAuthLoading && !isCustomerAuthenticated) {
      router.replace('/account/login?redirect=/account/dashboard');
    }
  }, [isCustomerAuthenticated, customerAuthLoading, router]);

  useEffect(() => {
    if (isCustomerAuthenticated && customer) {
      loadDashboardData();
    }
  }, [isCustomerAuthenticated, customer, loadDashboardData]);

  if (customerAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
        <p className="ml-3 text-lg text-white">Carregando sua área...</p>
      </div>
    );
  }

  if (!isCustomerAuthenticated || !customer) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-[#0a0a0a]">
        <p className="text-lg text-white">Redirecionando para login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-white">
              Bem-vindo(a), {customer.name || 'Cliente'}!
            </h1>
            <p className="text-gray-400 mt-1">Gerencie seus pedidos, endereços e informações pessoais.</p>
          </div>
          <Button variant="destructive" onClick={customerLogout} className="w-fit">
            <LogOut className="mr-2 h-4 w-4" /> Sair da Conta
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-neutral-900 border border-neutral-800 p-1 h-auto grid grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white h-10">
              <LayoutDashboard className="mr-2 h-4 w-4 hidden sm:inline" /> Painel
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-red-600 data-[state=active]:text-white h-10">
              <Package className="mr-2 h-4 w-4 hidden sm:inline" /> Meus Pedidos
            </TabsTrigger>
            <TabsTrigger value="addresses" className="data-[state=active]:bg-red-600 data-[state=active]:text-white h-10">
              <MapPin className="mr-2 h-4 w-4 hidden sm:inline" /> Endereços
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-red-600 data-[state=active]:text-white h-10">
              <User className="mr-2 h-4 w-4 hidden sm:inline" /> Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-neutral-900/60 border-neutral-800 text-white cursor-pointer hover:bg-neutral-800/60 transition-colors" onClick={() => setActiveTab('orders')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-red-500" /> Pedidos Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm text-gray-400">Total de pedidos realizados</p>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900/60 border-neutral-800 text-white cursor-pointer hover:bg-neutral-800/60 transition-colors" onClick={() => setActiveTab('addresses')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-500" /> Endereços
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{userData?.user_metadata?.addresses?.length || 0}</p>
                  <p className="text-sm text-gray-400">Endereços cadastrados</p>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900/60 border-neutral-800 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-red-500" /> Dados da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium truncate">{customer.email}</p>
                  <p className="text-sm text-gray-400">Clique em Perfil para editar</p>
                </CardContent>
              </Card>
            </div>

            {orders.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Último Pedido</h2>
                <OrderList orders={[orders[0]]} loading={loading} />
                <Button variant="link" onClick={() => setActiveTab('orders')} className="text-red-500 p-0 mt-2">
                  Ver todos os pedidos →
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="outline-none">
            <Card className="bg-neutral-900/60 border-neutral-800 text-white">
              <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
                <CardDescription className="text-gray-400">Visualize e acompanhe todas as suas compras.</CardDescription>
              </CardHeader>
              <CardContent>
                <OrderList orders={orders} loading={loading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="outline-none">
            <Card className="bg-neutral-900/60 border-neutral-800 text-white">
              <CardHeader>
                <CardTitle>Meus Endereços</CardTitle>
                <CardDescription className="text-gray-400">Gerencie seus endereços para agilizar o checkout.</CardDescription>
              </CardHeader>
              <CardContent>
                <AddressList
                  userId={customer.id}
                  addresses={userData?.user_metadata?.addresses || []}
                  onUpdate={loadDashboardData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="outline-none">
            <Card className="bg-neutral-900/60 border-neutral-800 text-white">
              <CardHeader>
                <CardTitle>Meus Dados</CardTitle>
                <CardDescription className="text-gray-400">Mantenha suas informações de contato atualizadas.</CardDescription>
              </CardHeader>
              <CardContent>
                {userData && <ProfileForm user={userData} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
