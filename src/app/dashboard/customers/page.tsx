
"use client";

import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import type { CustomerUser } from '@/types';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Users, Eye, ShieldAlert, Info, PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import CustomerFormDialog from '@/components/CustomerFormDialog'; // Import the new component

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function ManageCustomersPage() {
  const { getAllRegisteredCustomers, customerAuthLoading, registerCustomerByAdmin } = useCustomerAuth();
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerUser | null>(null);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!customerAuthLoading) {
      setCustomers(getAllRegisteredCustomers());
    }
  }, [getAllRegisteredCustomers, customerAuthLoading]);

  // Re-fetch customers when one is added to see it immediately
  const handleCustomerAdded = () => {
    if (!customerAuthLoading) {
      setCustomers(getAllRegisteredCustomers());
    }
  };

  const handleViewDetails = (customer: CustomerUser) => {
    setSelectedCustomer(customer);
    setIsPasswordPromptOpen(true);
    setAdminPassword('');
  };

  const handlePasswordSubmit = () => {
    if (adminPassword === 'password') {
      setIsPasswordPromptOpen(false);
      setIsDetailsModalOpen(true);
    } else {
      toast({
        title: "Senha Incorreta",
        description: "A senha de administrador fornecida está incorreta.",
        variant: "destructive",
      });
    }
  };

  if (customerAuthLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-9 sm:h-10 w-full sm:w-1/3" />
        <Skeleton className="h-9 sm:h-10 w-full sm:w-40" />
        <div className="bg-card p-0 rounded-lg shadow-md overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border-b">
              <div className="space-y-1.5 sm:space-y-2 flex-grow">
                <Skeleton className="h-3.5 sm:h-4 w-3/4" />
                <Skeleton className="h-3.5 sm:h-4 w-1/2" />
              </div>
              <Skeleton className="h-7 sm:h-8 w-20 sm:w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-foreground flex items-center">
          <Users className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 text-primary" /> Gerenciar Clientes
        </h1>
        <Button onClick={() => setIsAddCustomerDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Adicionar Cliente
        </Button>
      </div>

      <div className="bg-card p-0 rounded-lg shadow-md overflow-x-auto">
        <ScrollArea className="h-[calc(100vh-18rem)] sm:h-[calc(100vh-22rem)]">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="px-2 py-3 sm:px-4">Nome</TableHead>
                <TableHead className="px-2 py-3 sm:px-4">Email</TableHead>
                <TableHead className="hidden sm:table-cell px-2 py-3 sm:px-4">Telefone</TableHead>
                <TableHead className="hidden md:table-cell px-2 py-3 sm:px-4">ID Cliente</TableHead>
                <TableHead className="hidden lg:table-cell px-2 py-3 sm:px-4">Registrado em</TableHead>
                <TableHead className="text-center px-2 py-3 sm:px-4">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length > 0 ? customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium px-2 py-3 sm:px-4 text-xs sm:text-sm">{customer.name}</TableCell>
                  <TableCell className="px-2 py-3 sm:px-4 text-xs sm:text-sm">{customer.email}</TableCell>
                  <TableCell className="hidden sm:table-cell px-2 py-3 sm:px-4 text-xs sm:text-sm">{customer.phone || '-'}</TableCell>
                  <TableCell className="hidden md:table-cell px-2 py-3 sm:px-4 text-xs sm:text-sm">{customer.id}</TableCell>
                  <TableCell className="hidden lg:table-cell px-2 py-3 sm:px-4 text-xs sm:text-sm">{formatDate(customer.registeredAt)}</TableCell>
                  <TableCell className="text-center px-2 py-3 sm:px-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(customer)}
                      className="text-xs sm:text-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" /> Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm sm:text-base">
                    Nenhum cliente registrado encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Admin Password Prompt Dialog */}
      <Dialog open={isPasswordPromptOpen} onOpenChange={setIsPasswordPromptOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl sm:text-2xl text-primary flex items-center">
              <ShieldAlert className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Acesso Restrito
            </DialogTitle>
            <DialogDescription>
              Para visualizar os detalhes do cliente, por favor, insira sua senha de administrador.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 sm:py-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Senha do Administrador</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="********"
                onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordSubmit(); }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="button" onClick={handlePasswordSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-lg bg-card">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl sm:text-2xl text-primary flex items-center">
                <Info className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Detalhes do Cliente
              </DialogTitle>
              <DialogDescription>
                Informações de {selectedCustomer.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 sm:py-4 text-sm sm:text-base">
              <div>
                <span className="font-semibold text-foreground">Nome: </span>
                <span className="text-muted-foreground">{selectedCustomer.name}</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Email: </span>
                <span className="text-muted-foreground">{selectedCustomer.email}</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Telefone: </span>
                <span className="text-muted-foreground">{selectedCustomer.phone || 'Não informado'}</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">ID Cliente: </span>
                <span className="text-muted-foreground">{selectedCustomer.id}</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Registrado em: </span>
                <span className="text-muted-foreground">{formatDate(selectedCustomer.registeredAt)}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40">
                <p className="text-xs text-muted-foreground italic">
                  Nota: Em um sistema real, apenas dados não críticos seriam exibidos aqui. Senhas de clientes NUNCA são armazenadas ou exibidas.
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="bg-primary hover:bg-primary/90 text-primary-foreground">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add New Customer Dialog */}
      <CustomerFormDialog
        open={isAddCustomerDialogOpen}
        onOpenChange={setIsAddCustomerDialogOpen}
        onCustomerAdded={handleCustomerAdded}
      />
    </div>
  );
}
