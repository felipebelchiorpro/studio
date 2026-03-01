"use client";

import type { User } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session on mount
    const checkAuth = async () => {
      // Sync pocketbase's LocalStorage to document cookie so Next.js Middleware can read it
      document.cookie = pb.authStore.exportToCookie({ httpOnly: false });

      if (pb.authStore.isValid) {
        const model = pb.authStore.model;
        if (model) {
          // Check if it's an admin (admins usually don't have 'collectionId' or have specific structure)
          // or just map generic fields
          setUser({
            id: model.id,
            email: model.email,
            name: (model as any).name || model.email || 'Admin', // Admins might not have name
            phone: (model as any).phone || '',
          });
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
      if (token && model) {
        setUser({
          id: model.id,
          email: model.email,
          name: (model as any).name || model.email || 'Admin',
          phone: (model as any).phone || '',
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    if (!password) {
      console.error("Login requires password");
      return;
    }
    try {
      // Try Admin Login first (Dashboard is for admins)
      console.log(`Attempting Admin login for ${email}...`);
      await pb.admins.authWithPassword(email, password);
      console.log("Admin login successful.");
    } catch (adminError: any) {
      console.warn("Admin login failed:", adminError.data || adminError.message);

      console.log(`Attempting User login fallback for ${email}...`);
      try {
        // Fallback to regular user login if intended
        await pb.collection('users').authWithPassword(email, password);
        console.log("User login successful.");
      } catch (userError: any) {
        console.error("User login failed:", userError.data || userError.message);

        // If both failed, decide which error to throw.
        // If the email matches the known admin email, throw the admin error.
        if (email === "contatofelipebelchior@gmail.com") {
          throw adminError;
        }
        throw userError; // Throw the last error otherwise
      }
    }
  };

  const logout = () => {
    pb.authStore.clear();
    document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
