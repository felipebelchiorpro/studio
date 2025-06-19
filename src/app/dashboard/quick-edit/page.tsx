
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { Product } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Save, XCircle, Edit, PackageSearch, AlertTriangleIcon } from "lucide-react";
import { useProduct } from '@/context/ProductContext';
import { Skeleton } from '@/components/ui/skeleton';

interface EditFormData {
  price: string;
  stock: string;
}

export default function QuickEditPage() {
  const { products: contextProducts, updateProduct: contextUpdateProduct, loading: productsLoading } = useProduct();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({ price: '', stock: '' });

  const [localProducts, setLocalProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!productsLoading) {
      setLocalProducts(contextProducts.map(p => ({...p}))); 
    }
  }, [contextProducts, productsLoading]);


  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditFormData({
      price: product.price.toString(),
      stock: product.stock.toString(),
    });
  };

  const handleCancel = () => {
    setEditingProductId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (productId: string) => {
    const productToUpdate = localProducts.find(p => p.id === productId);
    if (!productToUpdate) return;

    const priceNum = parseFloat(editFormData.price);
    const stockNum = parseInt(editFormData.stock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      toast({ title: "Erro", description: "Preço inválido.", variant: "destructive" });
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      toast({ title: "Erro", description: "Estoque inválido.", variant: "destructive" });
      return;
    }

    const updatedProduct = { ...productToUpdate, price: priceNum, stock: stockNum };
    contextUpdateProduct(updatedProduct); 
    setLocalProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p)); 

    toast({ title: "Salvo!", description: `${updatedProduct.name} atualizado com sucesso.` });
    setEditingProductId(null);
  };

  const filteredProducts = useMemo(() => localProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.name.localeCompare(b.name)), [localProducts, searchTerm]);

  if (productsLoading) {
     return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-9 sm:h-10 w-full sm:w-1/3" />
        <Skeleton className="h-10 sm:h-12 w-full" />
        <div className="bg-card p-0 rounded-lg shadow-md overflow-x-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border-b">
              <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-md" />
              <Skeleton className="h-3.5 sm:h-4 w-1/4" />
              <Skeleton className="h-7 sm:h-8 w-16 sm:w-20 ml-auto" />
              <Skeleton className="h-7 sm:h-8 w-16 sm:w-20" />
              <Skeleton className="h-7 sm:h-8 w-20 sm:w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="font-headline text-2xl sm:text-3xl font-bold text-foreground">Edição Rápida de Produtos</h1>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center p-3 sm:p-4 bg-card rounded-lg shadow">
        <div className="relative w-full sm:max-w-md">
          <PackageSearch className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 sm:pl-10 text-sm sm:text-base"
          />
        </div>
      </div>

      <div className="bg-card p-0 rounded-lg shadow-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] sm:w-[60px] px-2 py-3 sm:px-4">Imagem</TableHead>
              <TableHead className="px-2 py-3 sm:px-4">Produto</TableHead>
              <TableHead className="w-[120px] sm:w-[150px] text-right px-2 py-3 sm:px-4">Preço (R$)</TableHead>
              <TableHead className="w-[100px] sm:w-[120px] text-center px-2 py-3 sm:px-4">Estoque</TableHead>
              <TableHead className="w-[180px] sm:w-[200px] text-center px-2 py-3 sm:px-4">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? filteredProducts.map((product) => (
              <TableRow key={product.id} className={editingProductId === product.id ? 'bg-muted/60' : ''}>
                <TableCell className="px-2 py-3 sm:px-4">
                  <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-md overflow-hidden bg-muted">
                    <Image src={product.imageUrl || "https://placehold.co/600x400.png"} alt={product.name} layout="fill" objectFit="cover" data-ai-hint="supplement product" />
                  </div>
                </TableCell>
                <TableCell className="px-2 py-3 sm:px-4">
                  <p className="font-medium text-xs sm:text-sm">{product.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{product.brand}</p>
                </TableCell>
                <TableCell className="text-right px-2 py-3 sm:px-4">
                  {editingProductId === product.id ? (
                    <Input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleInputChange}
                      className="h-8 sm:h-9 w-20 sm:w-24 text-right ml-auto text-xs sm:text-sm"
                      step="0.01"
                    />
                  ) : (
                    <span className="font-semibold text-primary text-xs sm:text-sm">
                      {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center px-2 py-3 sm:px-4">
                  {editingProductId === product.id ? (
                    <Input
                      type="number"
                      name="stock"
                      value={editFormData.stock}
                      onChange={handleInputChange}
                      className="h-8 sm:h-9 w-16 sm:w-20 text-center mx-auto text-xs sm:text-sm"
                    />
                  ) : (
                    <span className={`font-semibold text-xs sm:text-sm ${product.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                       {product.stock < 10 && <AlertTriangleIcon className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 mb-0.5" />}
                      {product.stock}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center px-2 py-3 sm:px-4">
                  {editingProductId === product.id ? (
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
                      <Button
                        size="sm"
                        onClick={() => handleSave(product.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 py-1 sm:px-3"
                      >
                        <Save className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        className="text-xs sm:text-sm px-2 py-1 sm:px-3"
                      >
                        <XCircle className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs sm:text-sm px-2 py-1 sm:px-3"
                    >
                      <Edit className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Editar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )) : (
               <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm sm:text-base">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

