
"use client";

import type { Product } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { mockProducts as initialSeedProducts } from '@/data/mockData'; // Used as seed

interface ProductContextType {
  products: Product[];
  getProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id' | 'salesCount' | 'rating' | 'reviews'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCT_STORAGE_KEY = 'darkstore-products';

const hydrateProduct = (productData: Partial<Product>): Product => {
  const defaults: Product = {
    id: productData.id || `prod-temp-${Date.now()}`, // Should always have an id from data or seed
    name: productData.name || 'Nome Indefinido',
    description: productData.description || 'Descrição Indefinida',
    price: productData.price || 0,
    originalPrice: productData.originalPrice || undefined,
    category: productData.category || 'Categoria Indefinida',
    brand: productData.brand || 'Marca Indefinida',
    imageUrl: productData.imageUrl || 'https://placehold.co/600x400.png',
    stock: productData.stock || 0,
    reviews: productData.reviews || [],
    rating: productData.rating || 0,
    isNewRelease: productData.isNewRelease || false,
    salesCount: productData.salesCount || 0,
  };
  return { ...defaults, ...productData };
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const persistProducts = useCallback((updatedProducts: Product[]) => {
    try {
      localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(updatedProducts));
    } catch (error) {
      console.error("Failed to save products to localStorage", error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    try {
      const storedProducts = localStorage.getItem(PRODUCT_STORAGE_KEY);
      if (storedProducts) {
        const parsedProducts: Partial<Product>[] = JSON.parse(storedProducts);
        const hydratedProducts = parsedProducts.map(p => hydrateProduct(p));
        setProducts(hydratedProducts);
      } else {
        const seededProducts = initialSeedProducts.map(p => hydrateProduct(p));
        setProducts(seededProducts);
        persistProducts(seededProducts);
      }
    } catch (error) {
      console.error("Failed to parse products from localStorage or seed error", error);
      const seededProductsOnError = initialSeedProducts.map(p => hydrateProduct(p));
      setProducts(seededProductsOnError); 
      persistProducts(seededProductsOnError);
    } finally {
      setLoading(false);
    }
  }, [persistProducts]);

  const getProducts = useCallback(() => {
    return [...products];
  }, [products]);

  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);

  const addProduct = (productData: Omit<Product, 'id' | 'salesCount' | 'rating' | 'reviews'>) => {
    const newProductWithDefaults: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      salesCount: 0,
      rating: 0,
      reviews: [],
      isNewRelease: productData.isNewRelease || false,
      originalPrice: productData.originalPrice || undefined,
      // Ensure all other fields from ProductData are present, hydrateProduct would be overkill here
      // as productData is mostly complete except for id and the defaults above.
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      brand: productData.brand,
      imageUrl: productData.imageUrl,
      stock: productData.stock,
    };
    const hydratedNewProduct = hydrateProduct(newProductWithDefaults); // Final hydration pass

    const newProducts = [hydratedNewProduct, ...products];
    setProducts(newProducts);
    persistProducts(newProducts);
    return hydratedNewProduct;
  };

  const updateProduct = (updatedProductData: Product) => {
    const hydratedUpdatedProduct = hydrateProduct(updatedProductData);
    const newProducts = products.map(p => (p.id === hydratedUpdatedProduct.id ? hydratedUpdatedProduct : p));
    setProducts(newProducts);
    persistProducts(newProducts);
  };

  const deleteProduct = (productId: string) => {
    const newProducts = products.filter(p => p.id !== productId);
    setProducts(newProducts);
    persistProducts(newProducts);
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

