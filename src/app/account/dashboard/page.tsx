
"use client";

import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerDashboardPage() {
  const { customer, isCustomerAuthenticated, customerAuthLoading, customerLogout } = useCustomerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!customerAuthLoading && !isCustomerAuthenticated) {
      router.replace('/account/login?redirect=/account/dashboard');
    }
  }, [isCustomerAuthenticated, customerAuthLoading, router]);

  if (customerAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg text-foreground">Carregando sua área...</p>
      </div>
    );
  }

  if (!isCustomerAuthenticated || !customer) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <p className="text-lg text-foreground">Redirecionando para login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 sm:py-12 px-4">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-foreground">
          Bem-vindo(a), {customer.name || 'Cliente'}!
        </h1>
        <p className="text-lg text-muted-foreground mt-1">Esta é a sua área de cliente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Meus Pedidos</CardTitle>
            <CardDescription>Veja seu histórico de compras.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Em breve: Lista de seus pedidos recentes.</p>
            {/* TODO: Link to order history page */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meus Endereços</CardTitle>
            <CardDescription>Gerencie seus endereços de entrega.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Em breve: Gerenciador de endereços.</p>
            {/* TODO: Link to address management page */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>Atualize suas informações.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Email: {customer.email}</p>
            <p className="text-sm text-muted-foreground">Em breve: Formulário de edição de dados.</p>
            {/* TODO: Link to personal data editing page */}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={customerLogout}>
          Sair da Conta
        </Button>
      </div>


    </div>
  );
}
