
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { mockCategories } from '@/data/mockData'; // For category names
import { useProduct } from '@/context/ProductContext'; // Import useProduct
import { useBrand } from '@/context/BrandContext'; // Import useBrand
import type { Product } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export interface Filters {
  categories: string[];
  priceRange: [number, number];
  brands: string[];
}

interface ProductFiltersProps {
  initialFilters?: Partial<Filters>;
  onFilterChange: (filters: Filters) => void;
}

const ALL_CATEGORIES = mockCategories.map(cat => cat.name); // Keep static categories for now

export default function ProductFilters({ initialFilters = {}, onFilterChange }: ProductFiltersProps) {
  const { products: allProducts, loading: productsLoading } = useProduct();
  const { getBrands, brands: contextBrands } = useBrand(); // Use useBrand

  // ALL_BRANDS will now be derived from BrandContext
  const ALL_BRANDS = useMemo(() => {
    return getBrands().sort(); // getBrands already returns sorted unique brands
  }, [contextBrands, getBrands]); // Depend on contextBrands to re-memoize when brands change
  
  const MAX_PRICE = useMemo(() => {
    if (productsLoading || allProducts.length === 0) return 1000; // Default max if no products or loading
    return Math.max(...allProducts.map(p => p.price), 100);
  }, [allProducts, productsLoading]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters.categories || []);
  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters.priceRange || [0, MAX_PRICE]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialFilters.brands || []);
  
  useEffect(() => {
    if (!productsLoading) {
      setPriceRange(prev => [prev[0], MAX_PRICE]);
    }
  }, [MAX_PRICE, productsLoading]);


  const handleCategoryChange = (categoryName: string, checked: boolean | "indeterminate") => {
    setSelectedCategories(prev =>
      checked ? [...prev, categoryName] : prev.filter(c => c !== categoryName)
    );
  };

  const handleBrandChange = (brandName: string, checked: boolean | "indeterminate") => {
    setSelectedBrands(prev =>
      checked ? [...prev, brandName] : prev.filter(b => b !== brandName)
    );
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const applyFilters = () => {
    onFilterChange({
      categories: selectedCategories,
      priceRange,
      brands: selectedBrands,
    });
  };
  
  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, MAX_PRICE]); 
    setSelectedBrands([]);
    onFilterChange({
      categories: [],
      priceRange: [0, MAX_PRICE],
      brands: [],
    });
  };

  if (productsLoading) { // Still show skeleton if products are loading (for MAX_PRICE)
    return (
      <div className="space-y-6 p-4 bg-card rounded-lg shadow-md">
        <Skeleton className="h-6 w-3/4 mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        ))}
        <div className="flex space-x-2 pt-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-card rounded-lg shadow-md">
      <h3 className="font-headline text-xl font-semibold text-foreground mb-4">Filtrar Produtos</h3>
      <Accordion type="multiple" defaultValue={['categories', 'price', 'brands']} className="w-full">
        <AccordionItem value="categories">
          <AccordionTrigger className="text-base font-medium hover:text-primary">Categorias</AccordionTrigger>
          <AccordionContent className="pt-2 space-y-2">
            {ALL_CATEGORIES.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                  aria-labelledby={`label-cat-${category}`}
                />
                <Label htmlFor={`cat-${category}`} id={`label-cat-${category}`} className="text-sm font-normal cursor-pointer">{category}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium hover:text-primary">Preço</AccordionTrigger>
          <AccordionContent className="pt-4 space-y-3">
            <Slider
              value={priceRange}
              max={MAX_PRICE}
              step={10}
              onValueChange={handlePriceChange}
              aria-label="Faixa de preço"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>R$ {priceRange[0].toFixed(0)}</span>
              <span>R$ {priceRange[1].toFixed(0)}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brands">
          <AccordionTrigger className="text-base font-medium hover:text-primary">Marcas</AccordionTrigger>
          <AccordionContent className="pt-2 space-y-2">
            {ALL_BRANDS.length > 0 ? ALL_BRANDS.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked) => handleBrandChange(brand, checked)}
                  aria-labelledby={`label-brand-${brand}`}
                />
                <Label htmlFor={`brand-${brand}`} id={`label-brand-${brand}`} className="text-sm font-normal cursor-pointer">{brand}</Label>
              </div>
            )) : (
                 <p className="text-xs text-muted-foreground">Nenhuma marca disponível. Adicione marcas no painel.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex space-x-2 pt-4">
        <Button onClick={applyFilters} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Aplicar Filtros</Button>
        <Button onClick={clearFilters} variant="outline" className="flex-1">Limpar Filtros</Button>
      </div>
    </div>
  );
}
