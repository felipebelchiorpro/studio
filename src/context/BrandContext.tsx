
"use client";

import type { Brand } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BrandContextType {
  brands: Brand[];
  addBrand: (brandData: Omit<Brand, 'id'>) => void;
  removeBrand: (brandId: string) => void;
  getBrands: () => Brand[];
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const BRAND_STORAGE_KEY = 'darkstore-brands';

export const BrandProvider = ({ children }: { children: ReactNode }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedBrands = localStorage.getItem(BRAND_STORAGE_KEY);
      if (storedBrands) {
        const parsed = JSON.parse(storedBrands);
        // Migration check: if stored items are strings, clear them or convert
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          // Basic migration for legacy strings if wanted, or just reset. 
          // Let's reset to empty to enforce new format as per plan.
          localStorage.removeItem(BRAND_STORAGE_KEY);
          setBrands([]);
        } else {
          setBrands(parsed);
        }
      } else {
        // No default brands initially to encourage adding real logos
        setBrands([]);
      }
    } catch (error) {
      console.error("Failed to parse brands from localStorage", error);
      localStorage.removeItem(BRAND_STORAGE_KEY);
    }
  }, []);

  const persistBrands = useCallback((updatedBrands: Brand[]) => {
    try {
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(updatedBrands));
    } catch (error) {
      console.error("Failed to save brands to localStorage", error);
    }
  }, []);

  const addBrand = (brandData: Omit<Brand, 'id'>) => {
    if (!brandData.name.trim()) {
      toast({ title: "Erro", description: "Nome da marca não pode ser vazio.", variant: "destructive" });
      return;
    }
    if (!brandData.imageUrl) {
      toast({ title: "Erro", description: "Logo da marca é obrigatória.", variant: "destructive" });
      return;
    }

    setBrands(prevBrands => {
      const normalizedNewBrandName = brandData.name.trim();
      const brandExists = prevBrands.some(
        b => b.name.toLowerCase() === normalizedNewBrandName.toLowerCase()
      );

      if (brandExists) {
        toast({ title: "Marca Existente", description: `A marca "${normalizedNewBrandName}" já existe.`, variant: "default" });
        return prevBrands;
      }

      const newBrand: Brand = {
        id: crypto.randomUUID(), // Modern browsers support this
        name: normalizedNewBrandName,
        imageUrl: brandData.imageUrl
      };

      const newBrands = [...prevBrands, newBrand].sort((a, b) => a.name.localeCompare(b.name));
      persistBrands(newBrands);
      toast({ title: "Marca Adicionada", description: `Marca "${normalizedNewBrandName}" adicionada com sucesso.` });
      return newBrands;
    });
  };

  const removeBrand = (brandId: string) => {
    setBrands(prevBrands => {
      const newBrands = prevBrands.filter(b => b.id !== brandId);
      persistBrands(newBrands);
      toast({ title: "Marca Removida", description: "Marca removida com sucesso." });
      return newBrands;
    });
  }

  const getBrands = useCallback(() => {
    return [...brands].sort((a, b) => a.name.localeCompare(b.name));
  }, [brands]);

  return (
    <BrandContext.Provider value={{ brands, addBrand, removeBrand, getBrands }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
