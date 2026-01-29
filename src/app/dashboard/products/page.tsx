
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, MoreHorizontal, Edit3, Trash2, Search, Sparkles } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/types";
import ProductForm from "@/components/ProductForm";
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProduct } from '@/context/ProductContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageProductsPage() {
  const { products: contextProducts, addProduct: contextAddProduct, updateProduct: contextUpdateProduct, deleteProduct: contextDeleteProduct, loading: productsLoading } = useProduct();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await contextDeleteProduct(productToDelete.id);
        toast({ title: "Produto Removido", description: `${productToDelete.name} foi removido com sucesso.` });
      } catch (error) {
        console.error("Erro ao remover produto:", error);
        toast({ title: "Erro na Remoção", description: "Não foi possível remover o produto. Verifique se ele está em uso ou se você tem permissão.", variant: "destructive" });
      } finally {
        setProductToDelete(null);
      }
    }
  };

  const handleSubmitProduct = async (data: Product, isEditing: boolean) => {
    const { id, ...productDataForContext } = data;

    try {
      if (isEditing && data.id) {
        await contextUpdateProduct(data);
        toast({ title: "Produto Atualizado", description: `${data.name} foi atualizado com sucesso.` });
      } else {
        await contextAddProduct(productDataForContext as Omit<Product, 'id' | 'salesCount' | 'rating' | 'reviews'>);
        toast({ title: "Produto Adicionado", description: `${data.name} foi adicionado com sucesso.` });
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast({ title: "Erro", description: "Ocorreu um erro ao salvar o produto.", variant: "destructive" });
    }
  };

  const filteredProducts = useMemo(() => contextProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name)), [contextProducts, searchTerm]);

  if (productsLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <Skeleton className="h-9 sm:h-10 w-full sm:w-1/4" />
          <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
        </div>
        <Skeleton className="h-9 sm:h-10 w-full sm:w-1/3" />
        <div className="bg-card p-0 rounded-lg shadow-md overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border-b">
              <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-md" />
              <div className="space-y-1.5 sm:space-y-2 flex-grow">
                <Skeleton className="h-3.5 sm:h-4 w-3/4" />
                <Skeleton className="h-3.5 sm:h-4 w-1/2" />
              </div>
              <Skeleton className="h-7 sm:h-8 w-16 sm:w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-foreground">Gerenciar Produtos</h1>
        <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Adicionar Produto
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 sm:pl-10 w-full max-w-md text-sm sm:text-base"
        />
      </div>

      <div className="bg-card p-0 rounded-lg shadow-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] sm:w-[80px] px-2 py-3 sm:px-4">Imagem</TableHead>
              <TableHead className="px-2 py-3 sm:px-4">Nome</TableHead>
              <TableHead className="hidden md:table-cell px-2 py-3 sm:px-4">Categoria</TableHead>
              <TableHead className="hidden lg:table-cell px-2 py-3 sm:px-4">Marca</TableHead>
              <TableHead className="text-right px-2 py-3 sm:px-4">Preço Venda</TableHead>
              <TableHead className="hidden xl:table-cell text-right px-2 py-3 sm:px-4">Preço Original</TableHead>
              <TableHead className="text-right px-2 py-3 sm:px-4">Estoque</TableHead>
              <TableHead className="text-center hidden sm:table-cell px-2 py-3 sm:px-4">Status</TableHead>
              <TableHead className="text-center px-2 py-3 sm:px-4">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="px-2 py-3 sm:px-4">
                  <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-md overflow-hidden bg-muted">
                    <Image src={product.imageUrl || "https://placehold.co/600x400.png"} alt={product.name} layout="fill" objectFit="cover" data-ai-hint="supplement product" />
                  </div>
                </TableCell>
                <TableCell className="font-medium px-2 py-3 sm:px-4 text-xs sm:text-sm">{product.name}</TableCell>
                <TableCell className="hidden md:table-cell px-2 py-3 sm:px-4 text-xs sm:text-sm">{product.category}</TableCell>
                <TableCell className="hidden lg:table-cell px-2 py-3 sm:px-4 text-xs sm:text-sm">{product.brand}</TableCell>
                <TableCell className="text-right font-semibold text-primary px-2 py-3 sm:px-4 text-xs sm:text-sm">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </TableCell>
                <TableCell className="hidden xl:table-cell text-right text-muted-foreground line-through px-2 py-3 sm:px-4 text-xs sm:text-sm">
                  {product.originalPrice ? `R$ ${product.originalPrice.toFixed(2).replace('.', ',')}` : '-'}
                </TableCell>
                <TableCell className={`text-right font-semibold px-2 py-3 sm:px-4 text-xs sm:text-sm ${product.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                  {product.stock}
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell px-2 py-3 sm:px-4">
                  {product.isNewRelease && (
                    <Badge variant="outline" className="border-primary text-primary text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2">
                      <Sparkles className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" /> Novo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center px-2 py-3 sm:px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEditProduct(product)} className="text-xs sm:text-sm">
                        <Edit3 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteProduct(product)} className="text-destructive focus:text-destructive focus:bg-destructive/10 text-xs sm:text-sm">
                        <Trash2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground text-sm sm:text-base">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProductForm
        product={editingProduct}
        onSubmitProduct={handleSubmitProduct}
        open={isFormOpen}
        onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingProduct(null);
        }}
      />

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o produto "{productToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

