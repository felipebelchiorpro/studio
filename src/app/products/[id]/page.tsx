
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Product, Review } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Star, ShoppingCart, ChevronLeft, ShieldCheck, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useProduct } from '@/context/ProductContext'; 
import { notFound } from 'next/navigation'; 

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};


export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { getProductById, loading: productsLoading } = useProduct();
  const [product, setProduct] = useState<Product | null | undefined>(undefined); 
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!productsLoading) {
      const foundProduct = getProductById(params.id);
        setProduct(foundProduct || null); 
    }
  }, [params.id, getProductById, productsLoading]);

  if (productsLoading || product === undefined) { 
    return (
      <div className="container mx-auto py-8 sm:py-12 px-4">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
          <div>
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2 mt-3 sm:mt-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-md" />)}
            </div>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <Skeleton className="h-8 sm:h-10 w-3/4" />
            <Skeleton className="h-5 sm:h-6 w-1/4" />
            <Skeleton className="h-10 sm:h-12 w-1/2" />
            <Skeleton className="h-20 sm:h-24 w-full" />
            <Skeleton className="h-9 sm:h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (product === null) { 
    notFound(); 
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Adicionado ao Carrinho!",
        description: `${quantity}x ${product.name} foi adicionado ao seu carrinho.`,
      });
    }
  };

  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : product.rating || 0;
  
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4">
      <div className="mb-4 sm:mb-6">
        <Link href="/products" className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
          Voltar para produtos
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
        <div className="sticky top-20 sm:top-24">
          <div className="aspect-square w-full relative overflow-hidden rounded-lg shadow-lg bg-card">
            <Image
              src={product.imageUrl || "https://placehold.co/600x400.png"}
              alt={product.name}
              layout="fill"
              objectFit="contain"
              className="p-2 sm:p-4"
              data-ai-hint="supplement product"
            />
             {product.isNewRelease && (
              <Badge variant="default" className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary text-primary-foreground text-xs sm:text-sm py-1 px-2 sm:px-3">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" /> NOVO!
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">{product.name}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Marca: <span className="text-foreground">{product.brand}</span> | Categoria: <span className="text-foreground">{product.category}</span></p>
          
          {averageRating > 0 && (
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
              <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-muted-foreground">({product.reviews?.length || 0} avaliações)</span>
            </div>
          )}

          <div className="flex items-baseline space-x-1.5 sm:space-x-2">
            <p className={`text-2xl sm:text-3xl font-semibold ${hasDiscount ? 'text-destructive' : 'text-primary'}`}>
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
            {hasDiscount && product.originalPrice && (
              <p className="text-lg sm:text-xl text-muted-foreground line-through">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <label htmlFor="quantity" className="text-xs sm:text-sm font-medium">Quantidade:</label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={product.stock > 0 ? product.stock : 1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
              className="w-16 sm:w-20 h-9 sm:h-10 rounded-md border border-input bg-background px-2 sm:px-3 py-1 sm:py-2 text-center text-sm"
              disabled={product.stock === 0}
            />
             {product.stock > 0 && <span className="text-xs text-muted-foreground">({product.stock} em estoque)</span>}
          </div>

          <Button 
            size="lg" 
            onClick={handleAddToCart} 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-base sm:text-lg py-2.5 sm:py-3"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Fora de Estoque'}
          </Button>
          
          {product.stock === 0 && <p className="text-destructive text-xs sm:text-sm text-center">Produto indisponível.</p>}

          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-green-500" />
            <span>Compra segura e entrega garantida.</span>
          </div>
        </div>
      </div>

      <Separator className="my-8 sm:my-12" />

      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
          <TabsTrigger value="description" className="text-sm sm:text-base py-2 sm:py-2.5">Descrição</TabsTrigger>
          <TabsTrigger value="reviews" className="text-sm sm:text-base py-2 sm:py-2.5">Avaliações ({product.reviews?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="prose prose-sm sm:prose-base prose-invert max-w-none p-3 sm:p-4 bg-card rounded-lg shadow">
          <p>{product.description}</p>
        </TabsContent>
        <TabsContent value="reviews" className="p-3 sm:p-4 bg-card rounded-lg shadow">
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {product.reviews.map((review: Review) => (
                <div key={review.id} className="border-b border-border/40 pb-3 sm:pb-4 last:border-b-0">
                  <div className="flex items-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground">{formatDate(review.date)}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground mb-0.5 sm:mb-1">{review.author}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base">Ainda não há avaliações.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

