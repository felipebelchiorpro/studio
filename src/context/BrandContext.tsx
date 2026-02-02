
"use client";

import type { Brand } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

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
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        // Map database fields to frontend type
        const mappedBrands: Brand[] = data.map((b: any) => ({
          id: b.id,
          name: b.name,
          imageUrl: b.image_url // Map snake_case to camelCase
        }));
        setBrands(mappedBrands);
      }
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
    if (!brandData.imageUrl) {
      toast({ title: "Erro", description: "Logo da marca é obrigatória.", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('brands')
        .insert([{
          name: brandData.name.trim(),
          image_url: brandData.imageUrl
        }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const newBrand: Brand = {
          id: data[0].id,
          name: data[0].name,
          imageUrl: data[0].image_url
        };
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
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);

      if (error) throw error;

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
