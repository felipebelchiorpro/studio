"use client";

import type { CustomerUser } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

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

// Keep this for the "Admin Dashboard" mock list only
const ALL_CUSTOMERS_STORAGE_KEY = 'darkstore-all-customers';

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState<boolean>(false);
  const [customerAuthLoading, setCustomerAuthLoading] = useState<boolean>(true);
  const [allCustomers, setAllCustomers] = useState<CustomerUser[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  // Load "Mock" customers for Admin Dashboard view
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

  // Supabase Auth Listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Map Supabase User to CustomerUser
        const user: CustomerUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Cliente',
          registeredAt: session.user.created_at,
          phone: session.user.phone
        };
        setCustomer(user);
        setIsCustomerAuthenticated(true);
      } else {
        setCustomer(null);
        setIsCustomerAuthenticated(false);
      }
      setCustomerAuthLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const customerLogin = async (email: string, password?: string) => {
    if (!password) {
      toast({ title: "Erro", description: "Senha é obrigatória.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Supabase login error:", error);
      toast({
        title: "Falha no Login",
        description: error.message === "Invalid login credentials" ? "Email ou senha incorretos." : error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Login realizado com sucesso!",
      description: "Bem-vindo de volta.",
    });
    // Redirect is handled by the calling component or let the auth state change trigger it? 
    // Usually better to let the caller redirect on success if needed, or have a gloabl listener. 
    // The existing code has redirect logic in the Page component watching `isCustomerAuthenticated`.
  };

  const customerLogout = async () => {
    await supabase.auth.signOut();
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
    // This remains a "Mock" feature for now as creating users in Supabase requires Service Role or SignUp (which logs you in).
    // Keeping local logic for display purposes in Admin Panel.
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
