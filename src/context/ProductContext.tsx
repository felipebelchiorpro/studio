
"use client";

import type { Product } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { fetchProductsService, createProductService, updateProductService, deleteProductService } from '@/services/productService';
// import { mockProducts as initialSeedProducts } from '@/data/mockData'; // Removed seed usage

interface ProductContextType {
  products: Product[];
  getProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id' | 'salesCount' | 'rating' | 'reviews'>) => Promise<Product | null>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCT_STORAGE_KEY = 'darkstore-products';

// Helper not needed as much if we rely on DB, but kept for partial fill if needed
const hydrateProduct = (productData: Partial<Product>): Product => {
  // ... keep existing implementation or simplify
  // For brevity, using simple spread as DB ensures structure mostly
  return productData as Product;
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProducts = async () => {
    // 1. Try to load from cache first for instant render
    try {
      const cached = localStorage.getItem(PRODUCT_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          setLoading(false); // Show content immediately
        }
      }
    } catch (e) {
      console.warn("Failed to load products from cache", e);
    }

    // 2. Fetch fresh data in background
    try {
      // Race between fetch and 10s timeout
      const timeoutPromise = new Promise<Product[]>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 30000)
      );

      const fetchedProducts = await Promise.race([
        fetchProductsService(),
        timeoutPromise
      ]);

      const reversed = fetchedProducts.reverse();
      setProducts(reversed);

      // Update cache
      localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(reversed));
    } catch (error) {
      console.warn("Failed to fetch products (likely timeout or network)", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const getProducts = useCallback(() => {
    return [...products];
  }, [products]);

  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);

  const addProduct = async (productData: Omit<Product, 'id' | 'salesCount' | 'rating' | 'reviews'>) => {
    try {
      const newProduct = await createProductService(productData);
      if (newProduct) {
        setProducts(prev => [newProduct, ...prev]);
        return newProduct;
      }
    } catch (error) {
      console.error("Failed to add product", error);
      throw error;
    }
    return null;
  };

  const updateProduct = async (updatedProductData: Product) => {
    try {
      await updateProductService(updatedProductData);
      setProducts(prevProducts => {
        return prevProducts.map(p => (p.id === updatedProductData.id ? updatedProductData : p));
      });
    } catch (error) {
      console.error("Failed to update product", error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteProductService(productId);
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Failed to delete product", error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{ products, getProducts, getProductById, addProduct, updateProduct, deleteProduct, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
