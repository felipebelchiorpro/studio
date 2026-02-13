"use client";

import type { CustomerUser } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { pb } from '@/lib/pocketbase';

interface CustomerAuthContextType {
  isCustomerAuthenticated: boolean;
  customer: CustomerUser | null;
  customerLogin: (email: string, password?: string) => Promise<void>;
  customerLogout: () => Promise<void>;
  customerAuthLoading: boolean;
  getAllRegisteredCustomers: () => CustomerUser[];
  registerCustomerByAdmin: (data: { name: string; email: string; phone?: string }) => Promise<boolean>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const ALL_CUSTOMERS_STORAGE_KEY = 'darkstore-all-customers';

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState<boolean>(false);
  const [customerAuthLoading, setCustomerAuthLoading] = useState<boolean>(true);
  const [allCustomers, setAllCustomers] = useState<CustomerUser[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedAllCustomers = localStorage.getItem(ALL_CUSTOMERS_STORAGE_KEY);
      if (storedAllCustomers) {
        setAllCustomers(JSON.parse(storedAllCustomers));
      }
    } catch (error) {
      console.error("Failed to parse all customers data from localStorage", error);
    }
  }, []);

  // PocketBase Auth Listener
  useEffect(() => {
    const checkInitialAuth = () => {
      if (pb.authStore.isValid && pb.authStore.model) {
        const model = pb.authStore.model;
        // Check if it's a record from the 'users' collection
        // Admins don't have collectionId/collectionName usually
        if ((model as any).collectionName === 'users') {
          setCustomer({
            id: model.id,
            email: model.email || '',
            name: (model as any).name || model.email?.split('@')[0] || 'Cliente',
            registeredAt: model.created,
            phone: (model as any).phone || ''
          });
          setIsCustomerAuthenticated(true);
        } else {
          // It's an admin or other type, but not our customer session
          setCustomer(null);
          setIsCustomerAuthenticated(false);
        }
      } else {
        setCustomer(null);
        setIsCustomerAuthenticated(false);
      }
      setCustomerAuthLoading(false);
    };

    checkInitialAuth();

    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (token && model && (model as any).collectionName === 'users') {
        setCustomer({
          id: model.id,
          email: model.email || '',
          name: (model as any).name || model.email?.split('@')[0] || 'Cliente',
          registeredAt: model.created,
          phone: (model as any).phone || ''
        });
        setIsCustomerAuthenticated(true);
      } else {
        setCustomer(null);
        setIsCustomerAuthenticated(false);
      }
      setCustomerAuthLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const customerLogin = async (email: string, password?: string) => {
    if (!password) {
      toast({ title: "Erro", description: "Senha é obrigatória.", variant: "destructive" });
      return;
    }

    try {
      await pb.collection('users').authWithPassword(email, password);

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
    } catch (error: any) {
      console.error("PocketBase login error:", error);
      toast({
        title: "Falha no Login",
        description: "Email ou senha incorretos.",
        variant: "destructive"
      });
    }
  };

  const customerLogout = async () => {
    pb.authStore.clear();
    setCustomer(null);
    setIsCustomerAuthenticated(false);
    router.push('/account/login');
  };

  const persistAllCustomers = useCallback((updatedCustomers: CustomerUser[]) => {
    try {
      localStorage.setItem(ALL_CUSTOMERS_STORAGE_KEY, JSON.stringify(updatedCustomers));
    } catch (error) {
      console.error("Failed to save all customers to localStorage", error);
    }
  }, []);

  const getAllRegisteredCustomers = useCallback(() => {
    return [...allCustomers].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [allCustomers]);

  const registerCustomerByAdmin = useCallback(async (data: { name: string; email: string; phone?: string }): Promise<boolean> => {
    const { name, email, phone } = data;
    const customerExists = allCustomers.some(c => c.email.toLowerCase() === email.toLowerCase());

    if (customerExists) {
      toast({
        title: "Erro ao Adicionar Cliente",
        description: `Um cliente com o email "${email}" já existe.`,
        variant: "destructive",
      });
      return false;
    }

    const customerId = `cust-admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newCustomer: CustomerUser = {
      id: customerId,
      email: email,
      name: name,
      registeredAt: new Date().toISOString(),
      phone: phone,
    };

    setAllCustomers(prevAllCustomers => {
      const updatedAll = [...prevAllCustomers, newCustomer].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      persistAllCustomers(updatedAll);
      return updatedAll;
    });

    toast({
      title: "Cliente Adicionado (Local)",
      description: `${name} foi adicionado à lista local.`,
    });
    return true;
  }, [allCustomers, persistAllCustomers, toast]);


  return (
    <CustomerAuthContext.Provider value={{
      isCustomerAuthenticated,
      customer,
      customerLogin,
      customerLogout,
      customerAuthLoading,
      getAllRegisteredCustomers,
      registerCustomerByAdmin
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
