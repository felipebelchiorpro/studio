

"use client";

import type { CustomerUser } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface CustomerAuthContextType {
  isCustomerAuthenticated: boolean;
  customer: CustomerUser | null;
  customerLogin: (email: string, name?: string) => void; 
  customerLogout: () => void;
  customerAuthLoading: boolean;
  getAllRegisteredCustomers: () => CustomerUser[]; // New function
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const CUSTOMER_AUTH_STORAGE_KEY = 'darkstore-customer-auth';
const ALL_CUSTOMERS_STORAGE_KEY = 'darkstore-all-customers'; // New key for all customers

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState<boolean>(false);
  const [customerAuthLoading, setCustomerAuthLoading] = useState<boolean>(true);
  const [allCustomers, setAllCustomers] = useState<CustomerUser[]>([]); // State for all customers
  const router = useRouter();

  useEffect(() => {
    // Load current logged-in customer
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

    // Load all registered customers
    try {
      const storedAllCustomers = localStorage.getItem(ALL_CUSTOMERS_STORAGE_KEY);
      if (storedAllCustomers) {
        setAllCustomers(JSON.parse(storedAllCustomers));
      }
    } catch (error) {
      console.error("Failed to parse all customers data from localStorage", error);
      localStorage.removeItem(ALL_CUSTOMERS_STORAGE_KEY);
    }
    setCustomerAuthLoading(false);
  }, []);

  const persistAllCustomers = useCallback((updatedCustomers: CustomerUser[]) => {
    try {
      localStorage.setItem(ALL_CUSTOMERS_STORAGE_KEY, JSON.stringify(updatedCustomers));
    } catch (error) {
      console.error("Failed to save all customers to localStorage", error);
    }
  }, []);

  const customerLogin = (email: string, name: string = `Cliente ${email.split('@')[0]}`) => {
    const customerId = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newCustomer: CustomerUser = { 
      id: customerId, 
      email, 
      name,
      registeredAt: new Date().toISOString() 
    };
    
    setCustomer(newCustomer);
    setIsCustomerAuthenticated(true);
    try {
      localStorage.setItem(CUSTOMER_AUTH_STORAGE_KEY, JSON.stringify({ isCustomerAuthenticated: true, customer: newCustomer }));
    } catch (error) {
      console.error("Failed to save customer auth data to localStorage", error);
    }

    // Add to all customers list if not already present (simulates registration)
    setAllCustomers(prevAllCustomers => {
      const customerExists = prevAllCustomers.some(c => c.email === email);
      if (!customerExists) {
        const updatedAll = [...prevAllCustomers, newCustomer];
        persistAllCustomers(updatedAll);
        return updatedAll;
      }
      return prevAllCustomers;
    });
  };

  const customerLogout = () => {
    setCustomer(null);
    setIsCustomerAuthenticated(false);
    try {
      localStorage.removeItem(CUSTOMER_AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to remove customer auth data from localStorage", error);
    }
    router.push('/account/login'); 
  };

  const getAllRegisteredCustomers = useCallback(() => {
    return [...allCustomers].sort((a, b) => new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime());
  }, [allCustomers]);

  return (
    <CustomerAuthContext.Provider value={{ 
      isCustomerAuthenticated, 
      customer, 
      customerLogin, 
      customerLogout, 
      customerAuthLoading,
      getAllRegisteredCustomers 
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
