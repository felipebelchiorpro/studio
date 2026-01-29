"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Product, Review, Partner } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Star, ShoppingCart, ChevronLeft, ShieldCheck, Zap, Truck, CheckCircle2, CreditCard, Tag, Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useProduct } from '@/context/ProductContext';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';
import { validateCoupon } from '@/actions/coupons';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import CustomerLoginForm from '@/components/CustomerLoginForm';
import { Dialog, DialogContent } from "@/components/ui/dialog";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { getProductById, loading: productsLoading } = useProduct();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Partner Discount State
  const [partnerCode, setPartnerCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; value: number; type: string; name: string; percent?: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const { addToCart } = useCart();
  const { toast } = useToast();
  const { customer } = useCustomerAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!productsLoading) {
      const foundProduct = getProductById(id);
      setProduct(foundProduct || null);
    }
  }, [id, getProductById, productsLoading]);

  // Auto-select first option - MOVED UP TO FIX HOOKS RULE
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) setSelectedSize(product.sizes[0]);
      if (product.flavors && product.flavors.length > 0 && !selectedFlavor) setSelectedFlavor(product.flavors[0]);
    }
  }, [product, selectedSize, selectedFlavor]);

  if (productsLoading || product === undefined) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="grid md:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          <Skeleton className="aspect-[3/4] w-full rounded-none" />
          <div className="space-y-6 pt-10">
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-8 w-1/2 mx-auto" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (product === null) {
    notFound();
  }

  const handleApplyCoupon = async () => {
    if (!partnerCode) return;
    setCouponLoading(true);

    // Call Server Action
    const result = await validateCoupon(partnerCode);

    if (result.valid) {
      setAppliedDiscount({
        code: partnerCode,
        percent: result.discountType === 'percent' ? result.value : 0, // Handle fixed later? For now logic expects percent
        // If fixed value, we need to handle it differently in calc. 
        // Let's assume percent for legacy UI compatibility for this moment or simply convert.
        // Actually, let's just pass the value and type and handle in render/calc.
        value: result.value,
        type: result.discountType,
        name: result.name
      });
      toast({
        title: "Desconto Aplicado!",
        description: result.message,
        className: "bg-green-600 text-white border-none"
      });
    } else {
      setAppliedDiscount(null);
      toast({
        title: "Cupom inválido",
        description: result.message || "Código não encontrado.",
        variant: "destructive"
      });
    }
    setCouponLoading(false);
  };

  const currentPrice = product.price; // Base Price

  // Calculate Final Price with Discount
  // Calculate Final Price with Discount
  const finalPrice = appliedDiscount
    ? appliedDiscount.type === 'percent'
      ? currentPrice * (1 - appliedDiscount.value / 100)
      : Math.max(0, currentPrice - appliedDiscount.value)
    : currentPrice;

  // Calculate Pix Price (5% off on final price, typical in BR e-commerce)
  // Actually, usually PIX price is the base for other calcs, but here let's assume PIX is final cash price
  // If partner discount is applied, it applies to the PIX price too.

  const handleAddToCart = () => {
    if (!customer) {
      setShowLogin(true);
      toast({
        title: "Login Necessário",
        description: "Faça login para adicionar itens ao carrinho.",
      });
      return;
    }

    if (product) {
      // NOTE: In a real app, you'd pass the applied discount to the cart here
      addToCart({
        ...product,
        price: finalPrice, // Add to cart with discounted price if applied? 
        // Ideally, cart logic should handle discounts, but for now we push the price.
        // Wait, addToCart logic might override price based on ID? 
        // Let's check addToCart later. For now, we communicate the success visually.
        // The User requested "add a field to APPLY the discount", visual feedback is key.
        couponCode: appliedDiscount?.code,
      }, quantity);

      toast({
        title: "Adicionado ao Carrinho!",
        description: `${quantity}x ${product.name} ${appliedDiscount ? `(${appliedDiscount.type === 'percent' ? `${appliedDiscount.value}%` : `R$ ${appliedDiscount.value}`} OFF)` : ''} adicionado.`,
      });
    }
  };

  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : product.rating || 0;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  // If partner discount is active, we show that as the main savings

  const sizes = product.sizes || [];
  const flavors = product.flavors || [];
  const hasSizes = sizes.length > 0;

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 max-w-7xl font-sans">
      <div className="mb-6">
        <Link href="/products" className="inline-flex items-center text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left Column: Images */}
        <div className="relative w-full max-w-[450px] mx-auto">
          <div className="aspect-[3/4] w-full relative overflow-hidden bg-secondary/20 rounded-sm">
            <Image
              src={product.imageUrl || "https://placehold.co/600x800.png"}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="hover:scale-105 transition-transform duration-700"
            />
            {product.isNewRelease && (
              <Badge className="absolute top-4 left-4 bg-black text-white rounded-none uppercase text-[10px] tracking-widest px-3 py-1">
                Novo Lançamento
              </Badge>
            )}
            {hasDiscount && !appliedDiscount && (
              <Badge className="absolute top-4 right-4 bg-destructive text-white rounded-none uppercase text-[10px] tracking-widest px-3 py-1">
                {Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF
              </Badge>
            )}
            {appliedDiscount && (
              <Badge className="absolute top-4 right-4 bg-[#16a34a] text-white rounded-none uppercase text-[10px] tracking-widest px-3 py-1 animate-pulse">
                {appliedDiscount.type === 'percent' ? `${appliedDiscount.value}%` : `R$ ${appliedDiscount.value}`} OFF PARCEIRO
              </Badge>
            )}
          </div>
        </div>

        {/* Right Column: Details (Centered Layout) */}
        <div className="flex flex-col items-start text-left space-y-6 md:pt-4 sticky top-24 self-start">

          {/* Header */}
          <div className="space-y-4 w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Rating removed as per user request */}

            {/* Price Section */}
            <div className="space-y-1 pt-2">
              {/* Show Original Price if Discounted (either by sale or partner) */}
              {(hasDiscount || appliedDiscount) && (
                <p className="text-sm text-muted-foreground line-through">
                  R$ {product.originalPrice ? product.originalPrice.toFixed(2).replace('.', ',') : product.price.toFixed(2).replace('.', ',')}
                </p>
              )}

              <div className="flex items-baseline gap-2">
                <span className={cn("text-3xl sm:text-4xl font-bold", appliedDiscount ? "text-[#16a34a]" : "text-[#16a34a]")}>
                  R$ {finalPrice.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-sm font-semibold text-[#16a34a]">à vista no PIX</span>
              </div>

              {appliedDiscount && (
                <p className="text-sm text-[#16a34a] font-medium flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Desconto de parceiro ({appliedDiscount.name}) aplicado!
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>ou <strong>R$ {(finalPrice * 1.05).toFixed(2).replace('.', ',')}</strong> em até 6x (sem juros)</span>
              </div>
              <p className="text-xs text-muted-foreground underline cursor-pointer hover:text-foreground">
                Mais formas de pagamento
              </p>
            </div>

            {/* Partner Discount Input */}
            <div className="flex items-center gap-2 pt-2">
              <div className="relative flex-1 max-w-[200px]">
                <input
                  type="text"
                  placeholder="Cupom"
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value)}
                  disabled={!!appliedDiscount} // Disable if already applied
                  className={cn(
                    "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    appliedDiscount ? "border-[#16a34a] text-[#16a34a]" : "border-input"
                  )}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !partnerCode || !!appliedDiscount}
              >
                {couponLoading ? "Validando..." : appliedDiscount ? "Aplicado" : "Aplicar"}
              </Button>
            </div>
            {appliedDiscount && (
              <button
                onClick={() => { setAppliedDiscount(null); setPartnerCode(''); }}
                className="text-xs text-red-500 hover:underline pt-0"
              >
                Remover cupom
              </button>
            )}

            <Separator className="bg-border/40" />

            {/* Size Selector (Clothing) */}
            {hasSizes && (
              <div className="space-y-3 w-full">
                <p className="text-sm font-medium text-foreground">
                  Tamanho: <span className="font-bold">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "h-10 min-w-[3rem] px-3 rounded-full border text-sm font-medium transition-all duration-200",
                        selectedSize === size
                          ? "border-[#16a34a] text-[#16a34a] bg-[#16a34a]/10 ring-1 ring-[#16a34a]"
                          : "border-input bg-background text-foreground hover:border-[#16a34a]/50"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Flavor Selector (Supplement) */}
            {flavors.length > 0 && (
              <div className="space-y-3 w-full">
                <p className="text-sm font-medium text-foreground">
                  Sabor: <span className="font-bold">{selectedFlavor}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {flavors.map((flavor) => (
                    <button
                      key={flavor}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={cn(
                        "h-10 px-4 rounded-full border text-sm font-medium transition-all duration-200",
                        selectedFlavor === flavor
                          ? "border-[#16a34a] text-[#16a34a] bg-[#16a34a]/10 ring-1 ring-[#16a34a]"
                          : "border-input bg-background text-foreground hover:border-[#16a34a]/50"
                      )}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-4 w-full">

              <div className="flex items-center gap-6">
                <span className="text-sm font-medium">Quantidade</span>
                <div className="flex items-center border border-input rounded-md max-w-[120px]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-10 text-center bg-transparent text-sm border-none focus:ring-0"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1 h-12 uppercase font-bold tracking-wider text-base rounded bg-[#15803d] hover:bg-[#166534] text-white shadow-md transition-all hover:scale-[1.01]"
                  disabled={product.stock === 0}
                >
                  {product.stock > 0 ? 'ADICIONAR AO CARRINHO' : 'INDISPONÍVEL'}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 hover:bg-transparent hover:text-red-500 transition-colors"
                  onClick={() => toggleFavorite(product.id)}
                  title={isFavorite(product.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <Heart className={cn("h-8 w-8", isFavorite(product.id) && "fill-red-500 text-red-500")} />
                </Button>
              </div>
            </div>
          </div>

          {/* Extra Info Accordions (Simulated with Tabs for now, or just links) */}
          <Accordion type="single" collapsible className="w-full max-w-md pt-8 border-t">
            <AccordionItem value="description">
              <AccordionTrigger className="text-sm font-bold uppercase tracking-wider hover:text-muted-foreground hover:no-underline">
                Descrição
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {product.description || "Sem descrição disponível."}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="benefits">
              <AccordionTrigger className="text-sm font-bold uppercase tracking-wider hover:text-muted-foreground hover:no-underline">
                Benefícios do Produto
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Alta qualidade e durabilidade.</li>
                  <li>Design exclusivo e moderno.</li>
                  <li>Ideal para uso diário ou ocasiões especiais.</li>
                  {/* Placeholder text as we don't have a specific benefits field yet */}
                </ul>
              </AccordionContent>
            </AccordionItem>


          </Accordion>

        </div>
      </div>
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md bg-white text-black p-0 border-none overflow-hidden">
          <CustomerLoginForm onSuccess={() => {
            setShowLogin(false);
            toast({ title: "Login realizado!", description: "Tente adicionar ao carrinho novamente.", className: "bg-green-600 text-white" });
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
