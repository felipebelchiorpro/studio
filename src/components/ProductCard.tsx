
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Zap } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Adicionado ao Carrinho!",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  const safePrice = typeof product.price === 'number' ? product.price : 0;
  const safeOriginalPrice = typeof product.originalPrice === 'number' ? product.originalPrice : 0;

  const hasDiscount = safeOriginalPrice > safePrice;
  const discountPercentage = hasDiscount && safeOriginalPrice > 0
    ? Math.round(((safeOriginalPrice - safePrice) / safeOriginalPrice) * 100)
    : 0;

  const installmentPrice = (safePrice / 3).toFixed(2).replace('.', ',');

  const discountValue = hasDiscount
    ? (safeOriginalPrice - safePrice).toFixed(2).replace('.', ',')
    : '0,00';

  return (
    <div className="flex flex-col h-full group select-none relative">
      <div className="relative aspect-[3/4] w-full bg-[#f0f0f0] mb-3 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300">

        <Link href={`/products/${product.id}`} passHref className="block w-full h-full relative cursor-pointer">
          {/* Main Image */}
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className={`transition-all duration-500 ease-in-out ${product.hoverImageUrl ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
          />

          {/* Hover Image */}
          {product.hoverImageUrl && (
            <Image
              src={product.hoverImageUrl}
              alt={`${product.name} back`}
              layout="fill"
              objectFit="cover"
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out group-hover:scale-105"
            />
          )}

          {/* Badges Container - Top Left */}
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5">
            {product.isNewRelease && (
              <span className="bg-[#e60012] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide shadow-sm flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> NOVO
              </span>
            )}
            {hasDiscount && (
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                -{discountPercentage}%
              </span>
            )}
          </div>
        </Link>

        {/* Floating "Quick Add" Button - Bottom Right Overlay - Shows on Hover */}
        <div className="absolute bottom-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={(e) => {
              e.preventDefault(); // Prevent navigating to product page
              handleAddToCart();
            }}
            className="bg-[#054F31] hover:bg-[#033E26] text-white shadow-lg text-xs font-bold py-1 px-4 h-8 rounded-full transition-transform transform active:scale-95 flex items-center gap-1.5 backdrop-blur-sm"
          >
            + Adicionar rápido
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-1">
        {/* Title */}
        <div className="mb-1">
          <Link href={`/products/${product.id}`} passHref>
            <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{product.category}</p>

        {/* Price Section */}
        <div className="mt-auto">
          {hasDiscount && (
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs text-muted-foreground line-through">R$ {safeOriginalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-extrabold text-[#054F31] dark:text-[#10B981]">R$ {safePrice.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
