
"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Banner } from "@/components/Banner";
import ProductCard from "@/components/ProductCard";
import { mockPromotions } from "@/data/mockData"; 
import type { Product } from "@/types";
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
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import InfoBar from '@/components/InfoBar';
import { cn } from "@/lib/utils";
import { useProduct } from '@/context/ProductContext'; 
import { Skeleton } from '@/components/ui/skeleton';


const CarouselDots = ({ api, onDotClick }: { api: CarouselApi | undefined, onDotClick: (index: number) => void }) => {
  const [snapCount, setSnapCount] = useState(0);
  const [currentSnap, setCurrentSnap] = useState(0);

  const updateDots = useCallback(() => {
    if (!api) return;
    setSnapCount(api.scrollSnapList().length);
    setCurrentSnap(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    
    updateDots();
    api.on("select", updateDots);
    api.on("reInit", updateDots);

    return () => {
      api.off("select", updateDots);
      api.off("reInit", updateDots);
    };
  }, [api, updateDots]);

  if (snapCount <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 mt-3 py-2">
      {Array.from({ length: snapCount }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={cn(
            "h-2.5 w-2.5 rounded-full transition-all duration-300 ease-in-out",
            index === currentSnap ? "bg-primary scale-125" : "bg-primary/40 hover:bg-primary/60"
          )}
          aria-label={`Ir para slide ${index + 1}`}
        />
      ))}
    </div>
  );
};


export default function HomePage() {
  const { products: allProducts, loading: productsLoading } = useProduct();

  const featuredProducts = useMemo(() => allProducts.slice(0, 8), [allProducts]);
  const popularProductsPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );
  const [apiPopular, setApiPopular] = useState<CarouselApi>();
  const handlePopularDotClick = useCallback((index: number) => apiPopular?.scrollTo(index), [apiPopular]);


  const newReleaseProducts = useMemo(() => allProducts.filter(p => p.isNewRelease).slice(0, 8), [allProducts]);
  const newReleasesPlugin = useRef(
    Autoplay({ delay: 4500, stopOnInteraction: true })
  );
  const [apiNewReleases, setApiNewReleases] = useState<CarouselApi>();
  const handleNewReleasesDotClick = useCallback((index: number) => apiNewReleases?.scrollTo(index), [apiNewReleases]);

  const bestSellingProducts = useMemo(() => 
    [...allProducts]
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 8), 
  [allProducts]);
  const bestSellersPlugin = useRef(
    Autoplay({ delay: 5500, stopOnInteraction: true })
  );
  const [apiBestSellers, setApiBestSellers] = useState<CarouselApi>();
  const handleBestSellersDotClick = useCallback((index: number) => apiBestSellers?.scrollTo(index), [apiBestSellers]);

  const onSaleProducts = useMemo(() => allProducts.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 8), [allProducts]);
  const onSaleProductsPlugin = useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true })
  );
  const [apiOnSale, setApiOnSale] = useState<CarouselApi>();
  const handleOnSaleDotClick = useCallback((index: number) => apiOnSale?.scrollTo(index), [apiOnSale]);

  if (productsLoading) {
    return (
      <div className="space-y-12">
        <Skeleton className="h-[40vh] w-full rounded-lg" />
        <Skeleton className="h-16 w-full" />
        {[...Array(4)].map((_, i) => ( // Increased to 4 sections for skeletons
          <section key={i}>
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-72 w-full rounded-lg" />)}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section aria-labelledby="banner-heading">
        <h2 id="banner-heading" className="sr-only">Promoções e Destaques</h2>
        <Banner promotions={mockPromotions} />
      </section>

      <InfoBar />
      
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
          <>
            <Carousel
              setApi={setApiPopular}
              plugins={[popularProductsPlugin.current]}
              className="w-full"
              opts={{
                align: "start",
                loop: featuredProducts.length > 3, 
              }}
              onMouseEnter={popularProductsPlugin.current.stop}
              onMouseLeave={popularProductsPlugin.current.reset}
            >
              <CarouselContent className="-ml-4">
                {featuredProducts.map((product: Product) => (
                  <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="h-full p-1">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
              <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
            </Carousel>
            <CarouselDots api={apiPopular} onDotClick={handlePopularDotClick} />
          </>
        ) : (
          <p className="text-muted-foreground">Nenhum produto popular encontrado.</p>
        )}
      </section>

      <section aria-labelledby="new-releases-heading">
        <div className="flex justify-between items-center mb-6">
          <h2 id="new-releases-heading" className="font-headline text-3xl font-semibold text-foreground uppercase">Lançamentos</h2>
          <Link href="/products?tag=lancamentos" passHref>
            <Button variant="ghost" className="text-primary hover:text-primary/90">
              Ver Todos <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {newReleaseProducts.length > 0 ? (
          <>
            <Carousel
              setApi={setApiNewReleases}
              plugins={[newReleasesPlugin.current]}
              className="w-full"
              opts={{
                align: "start",
                loop: newReleaseProducts.length > 3,
              }}
              onMouseEnter={newReleasesPlugin.current.stop}
              onMouseLeave={newReleasesPlugin.current.reset}
            >
              <CarouselContent className="-ml-4">
                {newReleaseProducts.map((product: Product) => (
                  <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="h-full p-1">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
              <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
            </Carousel>
            <CarouselDots api={apiNewReleases} onDotClick={handleNewReleasesDotClick} />
          </>
        ) : (
           <p className="text-muted-foreground">Nenhum lançamento encontrado.</p>
        )}
      </section>

       <section aria-labelledby="best-selling-products-heading">
        <div className="flex justify-between items-center mb-6">
          <h2 id="best-selling-products-heading" className="font-headline text-3xl font-semibold text-foreground uppercase">Mais Vendidos</h2>
          <Link href="/products?filter=best-sellers" passHref>
            <Button variant="ghost" className="text-primary hover:text-primary/90">
              Ver Todos <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {bestSellingProducts.length > 0 ? (
          <>
            <Carousel
              setApi={setApiBestSellers}
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
                  <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="h-full p-1">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
              <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
            </Carousel>
            <CarouselDots api={apiBestSellers} onDotClick={handleBestSellersDotClick} />
          </>
        ) : (
           <p className="text-muted-foreground">Nenhum produto mais vendido encontrado.</p>
        )}
      </section>

      <section aria-labelledby="featured-categories-heading">
        <div className="flex justify-between items-center mb-6">
          <h2 id="featured-categories-heading" className="font-headline text-3xl font-semibold text-foreground uppercase">Categorias em Destaque</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Left Big Item: GANHO DE MASSA */}
          <Link href="/products?category=GANHO%20DE%20MASSA" passHref>
            <div className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-border/40 hover:border-border/70 shadow-none transition-all duration-300 cursor-pointer">
              <Image src="https://placehold.co/600x800.png" alt="Ganho de Massa" layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105 brightness-50 group-hover:brightness-75" data-ai-hint="muscle fitness torso"/>
              <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center">
                <h3 className="font-headline text-3xl md:text-4xl font-bold text-primary uppercase shadow-md mb-3">GANHO DE MASSA</h3>
                <Button variant="secondary" size="sm" className="bg-neutral-800/80 hover:bg-neutral-900/90 text-white px-6 py-2">Ver Agora</Button>
              </div>
            </div>
          </Link>

          {/* Right Column Container */}
          <div className="grid grid-rows-2 gap-4 md:gap-6">
            {/* Top Right Item: ENDURANCE */}
            <Link href="/products?category=ENDURANCE" passHref>
              <div className="group relative h-full w-full overflow-hidden rounded-lg border border-border/40 hover:border-border/70 shadow-none transition-all duration-300 cursor-pointer">
                <Image src="https://placehold.co/800x400.png" alt="Endurance" layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105 brightness-50 group-hover:brightness-75" data-ai-hint="runner motion"/>
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                  <h3 className="font-headline text-2xl md:text-3xl font-bold text-primary uppercase shadow-md mb-2">ENDURANCE</h3>
                  <Button variant="secondary" size="sm" className="bg-neutral-800/80 hover:bg-neutral-900/90 text-white px-5 py-1.5">Ver Agora</Button>
                </div>
              </div>
            </Link>

            {/* Bottom Right Items Container */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 h-full">
              {/* Bottom Left of Right: EMAGRECIMENTO */}
              <Link href="/products?category=EMAGRECIMENTO" passHref>
                <div className="group relative h-full w-full overflow-hidden rounded-lg border border-border/40 hover:border-border/70 shadow-none transition-all duration-300 cursor-pointer">
                  <Image src="https://placehold.co/400x400.png" alt="Emagrecimento" layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105 brightness-50 group-hover:brightness-75" data-ai-hint="waist measure fitness"/>
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-3 text-center">
                    <h3 className="font-headline text-xl md:text-2xl font-bold text-primary uppercase shadow-md mb-2">EMAGRECIMENTO</h3>
                    <Button variant="secondary" size="sm" className="bg-neutral-800/80 hover:bg-neutral-900/90 text-white px-4 py-1">Ver Agora</Button>
                  </div>
                </div>
              </Link>
              {/* Bottom Right of Right: DEFINIÇÃO */}
              <Link href="/products?category=DEFINIÇÃO" passHref>
                <div className="group relative h-full w-full overflow-hidden rounded-lg border border-border/40 hover:border-border/70 shadow-none transition-all duration-300 cursor-pointer">
                  <Image src="https://placehold.co/400x400.png" alt="Definição" layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105 brightness-50 group-hover:brightness-75" data-ai-hint="abs fitness definition"/>
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-3 text-center">
                    <h3 className="font-headline text-xl md:text-2xl font-bold text-primary uppercase shadow-md mb-2">DEFINIÇÃO</h3>
                    <Button variant="secondary" size="sm" className="bg-neutral-800/80 hover:bg-neutral-900/90 text-white px-4 py-1">Ver Agora</Button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="on-sale-products-heading">
        <div className="flex justify-between items-center mb-6">
          <h2 id="on-sale-products-heading" className="font-headline text-3xl font-semibold text-foreground uppercase">Em Promoção</h2>
          <Link href="/products?filter=on-sale" passHref>
            <Button variant="ghost" className="text-primary hover:text-primary/90">
              Ver Todos <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {onSaleProducts.length > 0 ? (
          <>
            <Carousel
              setApi={setApiOnSale}
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
                  <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="h-full p-1">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
              <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
            </Carousel>
            <CarouselDots api={apiOnSale} onDotClick={handleOnSaleDotClick} />
          </>
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

    