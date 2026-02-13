
"use client";

import type { Brand } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchBrandsService, createBrandService, deleteBrandService } from '@/services/brandService';

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

  const fetchBrands = useCallback(async () => {
    try {
      const data = await fetchBrandsService();
      setBrands(data);
    } catch (error) {
      console.error("Erro ao buscar marcas:", error);
      toast({ title: "Erro", description: "Falha ao carregar marcas.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const addBrand = async (brandData: Omit<Brand, 'id'>) => {
    if (!brandData.name.trim()) {
      toast({ title: "Erro", description: "Nome da marca não pode ser vazio.", variant: "destructive" });
      return;
    }
    // We allow empty image for now or handled by service
    // if (!brandData.imageUrl) { ... }

    try {
      const newBrand = await createBrandService(brandData);
      if (newBrand) {
        setBrands(prev => [...prev, newBrand].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: "Marca Adicionada", description: `Marca "${newBrand.name}" adicionada com sucesso.` });
      }
    } catch (error) {
      console.error("Erro ao adicionar marca:", error);
      toast({ title: "Erro", description: "Falha ao salvar marca no banco.", variant: "destructive" });
    }
  };

  const removeBrand = async (brandId: string) => {
    try {
      await deleteBrandService(brandId);
      setBrands(prev => prev.filter(b => b.id !== brandId));
      toast({ title: "Marca Removida", description: "Marca removida com sucesso." });
    } catch (error) {
      console.error("Erro ao remover marca:", error);
      toast({ title: "Erro", description: "Falha ao remover marca.", variant: "destructive" });
    }
  };

  const getBrands = useCallback(() => {
    return brands;
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
