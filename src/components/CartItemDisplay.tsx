
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus } from 'lucide-react';
import type { CartItem } from '@/types';
import { useCart } from '@/context/CartContext';

interface CartItemDisplayProps {
  item: CartItem;
  compact?: boolean;
}

export default function CartItemDisplay({ item, compact = false }: CartItemDisplayProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0 && newQuantity <= item.stock) {
      updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className={`flex gap-3 sm:gap-4 items-start py-3 sm:py-4 border-b border-border/40 last:border-0 ${compact ? 'text-sm' : ''}`}>
      <Link href={`/products/${item.id}`} passHref>
        <div className={`relative ${compact ? 'w-16 h-16' : 'w-20 h-20 sm:w-24 sm:h-24'} flex-shrink-0 bg-secondary/20 rounded-md overflow-hidden`}>
          <Image
            src={item.imageUrl}
            alt={item.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint="supplement product"
          />
        </div>
      </Link>

      <div className="flex-grow min-w-0 sm:w-auto">
        <Link href={`/products/${item.id}`} passHref>
          <h3 className="text-sm md:text-base font-medium hover:text-primary transition-colors cursor-pointer truncate">{item.name}</h3>
        </Link>
        <p className="text-xs text-muted-foreground">{item.brand}</p>
        <p className="text-sm font-semibold text-primary mt-1">
          R$ {item.price.toFixed(2).replace('.', ',')}
        </p>
      </div>

      <div className="flex items-center space-x-1.5 sm:space-x-2 w-auto justify-between sm:justify-start">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Diminuir quantidade" className="h-8 w-8 sm:h-9 sm:w-9">
            <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
            min="1"
            max={item.stock}
            className="h-8 w-12 sm:h-9 sm:w-14 text-center px-1 text-sm"
            aria-label={`Quantidade de ${item.name}`}
          />
          <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label="Aumentar quantidade" className="h-8 w-8 sm:h-9 sm:w-9">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <div className="text-sm md:text-base font-semibold w-auto sm:w-20 text-right ml-2 sm:ml-0">
          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
        </div>

        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive h-8 w-8 sm:h-9 sm:w-9" aria-label={`Remover ${item.name} do carrinho`}>
          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>
  );
}

