
"use client";

import React, { useRef } from 'react';
import { Banner } from "@/components/Banner";
import ProductCard from "@/components/ProductCard";
import { mockProducts, mockCategories, mockPromotions } from "@/data/mockData";
import type { Product, Category as TopCategoryType } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import InfoBar from '@/components/InfoBar';

export default function HomePage() {
  const featuredProducts = mockProducts.slice(0, 8);
  const popularProductsPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const bestSellingProducts = mockProducts.filter(p => (p.rating || 0) >= 4.5).slice(0, 8);
  const bestSellersPlugin = useRef(
    Autoplay({ delay: 5500, stopOnInteraction: true })
  );

  const onSaleProducts = mockProducts.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 8);
  const onSaleProductsPlugin = useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true })
  );

  return (
    <div className="space-y-12">
      <section aria-labelledby="banner-heading">
        <h2 id="banner-heading" className="sr-only">Promoções e Destaques</h2>
        <Banner promotions={mockPromotions} />
      </section>

      <InfoBar />

      <section aria-labelledby="featured-categories-heading">
        <div className="flex justify-between items-center mb-6">
          <h2 id="featured-categories-heading" className="font-headline text-3xl font-semibold text-foreground uppercase">Categorias em Destaque</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {mockCategories.filter(cat => cat.id !== "catComboOffers").slice(0, 4).map((category: TopCategoryType) => (
            <Link key={category.id} href={`/products?category=${encodeURIComponent(category.name)}`} passHref>
              <div className="group relative aspect-video overflow-hidden rounded-lg border border-border/40 hover:border-border/70 shadow-none transition-all duration-300 cursor-pointer">
                {category.imageUrl && (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105 brightness-75 group-hover:brightness-90"
                    data-ai-hint="fitness category"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-2">
                  <h3 className="font-headline text-lg md:text-xl font-bold text-white text-center uppercase">{category.name.toUpperCase()}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="popular-products-heading">
        <div className="flex justify-between items-center mb-6">
          <h2 id="popular-products-heading" className="font-headline text-3xl font-semibold text-foreground uppercase">Produtos Populares</h2>
          <Link href="/products" passHref>
            <Button variant="ghost" className="text-primary hover:text-primary/90">
              Ver Todos <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {featuredProducts.length > 0 ? (
          <Carousel
            plugins={[popularProductsPlugin.current]}
            className="w-full"
            opts={{
              align: "start",
              loop: featuredProducts.length > 3, // Loop if enough items for md view
            }}
            onMouseEnter={popularProductsPlugin.current.stop}
            onMouseLeave={popularProductsPlugin.current.reset}
          >
            <CarouselContent className="-ml-4">
              {featuredProducts.map((product: Product) => (
                <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/4">
                  <div className="h-full p-1">
                    <ProductCard product={product} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
            <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
          </Carousel>
        ) : (
          <p className="text-muted-foreground">Nenhum produto popular encontrado.</p>
        )}
      </section>

      <section aria-labelledby="best-selling-products-heading">
        <div className="flex justify-between items-center mb-6">
          <h2 id="best-selling-products-heading" className="font-headline text-3xl font-semibold text-foreground uppercase">Mais Vendidos</h2>
          <Link href="/products" passHref>
            <Button variant="ghost" className="text-primary hover:text-primary/90">
              Ver Todos <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {bestSellingProducts.length > 0 ? (
          <Carousel
            plugins={[bestSellersPlugin.current]}
            className="w-full"
            opts={{
              align: "start",
              loop: bestSellingProducts.length > 3,
            }}
            onMouseEnter={bestSellersPlugin.current.stop}
            onMouseLeave={bestSellersPlugin.current.reset}
          >
            <CarouselContent className="-ml-4">
              {bestSellingProducts.map((product: Product) => (
                <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/4">
                  <div className="h-full p-1">
                    <ProductCard product={product} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
            <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
          </Carousel>
        ) : (
           <p className="text-muted-foreground">Nenhum produto mais vendido encontrado.</p>
        )}
      </section>

      <section aria-labelledby="on-sale-products-heading">
        <div className="flex justify-between items-center mb-6">
          <h2 id="on-sale-products-heading" className="font-headline text-3xl font-semibold text-foreground uppercase">Em Promoção</h2>
          <Link href="/products" passHref>
            <Button variant="ghost" className="text-primary hover:text-primary/90">
              Ver Todas <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {onSaleProducts.length > 0 ? (
          <Carousel
            plugins={[onSaleProductsPlugin.current]}
            className="w-full"
            opts={{
              align: "start",
              loop: onSaleProducts.length > 3,
            }}
            onMouseEnter={onSaleProductsPlugin.current.stop}
            onMouseLeave={onSaleProductsPlugin.current.reset}
          >
            <CarouselContent className="-ml-4">
              {onSaleProducts.map((product: Product) => (
                <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/4">
                  <div className="h-full p-1">
                    <ProductCard product={product} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
            <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
          </Carousel>
        ) : (
          <p className="text-muted-foreground">Nenhum produto em promoção encontrado.</p>
        )}
      </section>

      <section aria-labelledby="call-to-action-heading" className="py-12 bg-card rounded-lg border border-border/40 shadow-none">
        <div className="container mx-auto text-center">
          <h2 id="call-to-action-heading" className="font-headline text-3xl font-semibold text-primary mb-4 uppercase">Pronto para Elevar seu Treino?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Descubra nossa linha completa de suplementos e alcance seus objetivos de performance e saúde.
          </p>
          <Link href="/products" passHref>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-10 py-4 rounded-md transition-transform duration-150 ease-in-out hover:scale-105">
              Explorar Produtos
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
