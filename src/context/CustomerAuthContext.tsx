
"use client";

import type { CustomerUser } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CustomerAuthContextType {
  isCustomerAuthenticated: boolean;
  customer: CustomerUser | null;
  customerLogin: (email: string, name?: string) => void; 
  customerLogout: () => void;
  customerAuthLoading: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const CUSTOMER_AUTH_STORAGE_KEY = 'darkstore-customer-auth';

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState<boolean>(false);
  const [customerAuthLoading, setCustomerAuthLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(CUSTOMER_AUTH_STORAGE_KEY);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        if (authData.isCustomerAuthenticated && authData.customer) {
          setCustomer(authData.customer);
          setIsCustomerAuthenticated(true);
        }
      }
    } catch (error) {
      console.error("Failed to parse customer auth data from localStorage", error);
      localStorage.removeItem(CUSTOMER_AUTH_STORAGE_KEY);
    }
    setCustomerAuthLoading(false);
  }, []);

  const customerLogin = (email: string, name: string = 'Cliente DarkStore') => {
    const mockCustomer: CustomerUser = { id: `cust-${Date.now()}`, email, name };
    setCustomer(mockCustomer);
    setIsCustomerAuthenticated(true);
    try {
      localStorage.setItem(CUSTOMER_AUTH_STORAGE_KEY, JSON.stringify({ isCustomerAuthenticated: true, customer: mockCustomer }));
    } catch (error) {
      console.error("Failed to save customer auth data to localStorage", error);
    }
  };

  const customerLogout = () => {
    setCustomer(null);
    setIsCustomerAuthenticated(false);
    try {
      localStorage.removeItem(CUSTOMER_AUTH_STORAGE_KEY);
    } catch (error)
      {
      console.error("Failed to remove customer auth data from localStorage", error);
    }
    router.push('/account/login'); // Redirect to customer login
  };

  return (
    <CustomerAuthContext.Provider value={{ isCustomerAuthenticated, customer, customerLogin, customerLogout, customerAuthLoading }}>
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
