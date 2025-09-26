
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

  const persistPromotions = useCallback((updatedPromotions: Promotion[]) => {
    try {
      localStorage.setItem(PROMOTION_STORAGE_KEY, JSON.stringify(updatedPromotions));
    } catch (error) {
      console.error("Failed to save promotions to localStorage", error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    try {
      const storedPromotions = localStorage.getItem(PROMOTION_STORAGE_KEY);
      if (storedPromotions) {
        setPromotions(JSON.parse(storedPromotions));
      } else {
        setPromotions(initialSeedPromotions);
        persistPromotions(initialSeedPromotions);
      }
    } catch (error) {
      console.error("Failed to parse promotions from localStorage", error);
      setPromotions(initialSeedPromotions);
      persistPromotions(initialSeedPromotions);
    } finally {
      setLoading(false);
    }
  }, [persistPromotions]);

  const getPromotionById = useCallback((id: string) => {
    return promotions.find(p => p.id === id);
  }, [promotions]);

  const addPromotion = (promotionData: Omit<Promotion, 'id'>) => {
    const newPromotion: Promotion = {
      ...promotionData,
      id: `promo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    setPromotions(prevPromotions => {
      const newPromotionsArray = [newPromotion, ...prevPromotions];
      persistPromotions(newPromotionsArray);
      return newPromotionsArray;
    });
    return newPromotion;
  };

  const updatePromotion = (updatedPromotionData: Promotion) => {
    setPromotions(prevPromotions => {
      const newPromotionsArray = prevPromotions.map(p => (p.id === updatedPromotionData.id ? updatedPromotionData : p));
      persistPromotions(newPromotionsArray);
      return newPromotionsArray;
    });
  };

  const deletePromotion = (promotionId: string) => {
    setPromotions(prevPromotions => {
      const newPromotionsArray = prevPromotions.filter(p => p.id !== promotionId);
      persistPromotions(newPromotionsArray);
      return newPromotionsArray;
    });
  };

  return (
    <PromotionContext.Provider value={{ promotions, getPromotionById, addPromotion, updatePromotion, deletePromotion, loading }}>
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
