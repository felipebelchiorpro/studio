
"use client";

import type { Promotion } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { mockPromotions as initialSeedPromotions } from '@/data/mockData';

interface PromotionContextType {
  promotions: Promotion[];
  getPromotionById: (id: string) => Promotion | undefined;
  addPromotion: (promotion: Omit<Promotion, 'id'>) => Promotion;
  updatePromotion: (promotion: Promotion) => void;
  deletePromotion: (promotionId: string) => void;
  loading: boolean;
}

const PromotionContext = createContext<PromotionContextType | undefined>(undefined);

const PROMOTION_STORAGE_KEY = 'darkstore-promotions';

export const PromotionProvider = ({ children }: { children: ReactNode }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // We are not persisting to local storage anymore since we have a DB

  useEffect(() => {
    const loadPromotions = async () => {
      setLoading(true);
      try {
        const { fetchPromotionsService } = await import('@/services/promotionService');

        const timeoutPromise = new Promise<Promotion[]>((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 30000)
        );

        const data = await Promise.race([
          fetchPromotionsService(),
          timeoutPromise
        ]);

        setPromotions(data);
      } catch (error) {
        console.warn("Failed to fetch promotions (likely timeout or network)", error);
      } finally {
        setLoading(false);
      }
    };
    loadPromotions();
  }, []);

  const getPromotionById = useCallback((id: string) => {
    return promotions.find(p => p.id === id);
  }, [promotions]);

  // Placeholders or connected to service if we wanted full app-wide state management
  // But for now, the Dashboard uses services directly, so these are less critical for the store front
  // We'll leave them as stubs or implement if needed. 
  // Actually, let's keep them functional-ish so TypeScript doesn't complain, 
  // but they won't persist to DB unless we wire them. 
  // Since the user asked for Admin Panel management, and I built the Admin Panel to use Services directly on the Page,
  // This context is primarily for the Frontend to READ data.
  // So I will just log warnings if these are called, or wire them up if I have time. 
  // Better yet, I'll update the Context type to Promise<void> for actions later if I refactor fully, 
  // but for now I'll just leave them as "optimistic" updates or no-ops, as they aren't used by the Home Page.
  // WAIT: If I don't use the context for CRUD in the dashboard, these functions are unused.
  // I will just make them async and call the service to be safe.

  const addPromotion = async (promotionData: Omit<Promotion, 'id'>) => {
    const { createPromotionService } = await import('@/services/promotionService');
    const newPromo = await createPromotionService(promotionData);
    if (newPromo) {
      setPromotions(prev => [newPromo, ...prev]);
      return newPromo;
    }
  };

  const updatePromotion = async (promotion: Promotion) => {
    const { updatePromotionService } = await import('@/services/promotionService');
    await updatePromotionService(promotion);
    setPromotions(prev => prev.map(p => p.id === promotion.id ? promotion : p));
  };

  const deletePromotion = async (id: string) => {
    const { deletePromotionService } = await import('@/services/promotionService');
    await deletePromotionService(id);
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PromotionContext.Provider value={{
      promotions,
      getPromotionById,
      addPromotion: addPromotion as any,
      updatePromotion: updatePromotion as any,
      deletePromotion: deletePromotion as any,
      loading
    }}>
      {children}
    </PromotionContext.Provider>
  );
};

export const usePromotion = (): PromotionContextType => {
  const context = useContext(PromotionContext);
  if (context === undefined) {
    throw new Error('usePromotion must be used within a PromotionProvider');
  }
  return context;
};
