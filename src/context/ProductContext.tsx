
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
    id: productData.id || `prod-temp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    name: productData.name || 'Nome Indefinido',
    description: productData.description || 'Descrição Indefinida',
    price: typeof productData.price === 'number' ? productData.price : 0,
    originalPrice: typeof productData.originalPrice === 'number' ? productData.originalPrice : undefined,
    category: productData.category || 'Categoria Indefinida',
    brand: productData.brand || 'Marca Indefinida',
    imageUrl: productData.imageUrl || 'https://placehold.co/600x400.png',
    stock: typeof productData.stock === 'number' ? productData.stock : 0,
    reviews: Array.isArray(productData.reviews) ? productData.reviews : [],
    rating: typeof productData.rating === 'number' ? productData.rating : 0,
    isNewRelease: typeof productData.isNewRelease === 'boolean' ? productData.isNewRelease : false,
    salesCount: typeof productData.salesCount === 'number' ? productData.salesCount : 0,
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
    const newProductPartial: Partial<Product> = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      // salesCount, rating, reviews will be handled by hydrateProduct defaults
    };
    const hydratedNewProduct = hydrateProduct(newProductPartial);

    setProducts(prevProducts => {
      const newProductsArray = [hydratedNewProduct, ...prevProducts];
      persistProducts(newProductsArray);
      return newProductsArray;
    });
    return hydratedNewProduct;
  };

  const updateProduct = (updatedProductData: Product) => {
    const hydratedUpdatedProduct = hydrateProduct(updatedProductData); // Ensure full hydration on update
    setProducts(prevProducts => {
      const newProductsArray = prevProducts.map(p => (p.id === hydratedUpdatedProduct.id ? hydratedUpdatedProduct : p));
      persistProducts(newProductsArray);
      return newProductsArray;
    });
  };

  const deleteProduct = (productId: string) => {
    setProducts(prevProducts => {
      const newProductsArray = prevProducts.filter(p => p.id !== productId);
      persistProducts(newProductsArray);
      return newProductsArray;
    });
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
