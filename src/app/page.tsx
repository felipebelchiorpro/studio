
"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Banner } from "@/components/Banner";
import ProductCard from "@/components/ProductCard";
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
import BrandCarousel from '@/components/BrandCarousel'; // Import the new component
import { cn } from "@/lib/utils";
import { useProduct } from '@/context/ProductContext';
import { usePromotion } from '@/context/PromotionContext'; // Added
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
    <div className="flex justify-center items-center space-x-1.5 sm:space-x-2 mt-2 sm:mt-3 py-1.5 sm:py-2">
      {Array.from({ length: snapCount }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={cn(
            "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-all duration-300 ease-in-out",
            index === currentSnap ? "bg-primary scale-110 sm:scale-125" : "bg-primary/40 hover:bg-primary/60"
          )}
          aria-label={`Ir para slide ${index + 1}`}
        />
      ))}
    </div>

  );
};


export default function HomePage() {
  const { products: allProducts, loading: productsLoading } = useProduct();
  const { promotions, loading: promotionsLoading } = usePromotion();
  const [carouselLoopThreshold, setCarouselLoopThreshold] = useState(3); // Default for desktop (lg screens, 4 items)

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 768) { // Corresponds to 'md' breakpoint (where 2 or sm 2 items are shown)
          setCarouselLoopThreshold(1); // Loop if more than 1 product (2 items visible)
        } else if (window.innerWidth < 1024) { // Corresponds to 'lg' breakpoint (where 3 items are shown)
          setCarouselLoopThreshold(2); // Loop if more than 2 products (3 items visible)
        } else {
          setCarouselLoopThreshold(3); // Loop if more than 3 products (4 items visible)
        }
      }
    };

    handleResize(); // Set initial value on client-side mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


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

  const mainCarouselPromotions = useMemo(() => promotions.filter(p => !p.position || p.position === 'main_carousel'), [promotions]);
  const gridLeft = useMemo(() => promotions.find(p => p.position === 'grid_left'), [promotions]);
  const gridTopRight = useMemo(() => promotions.find(p => p.position === 'grid_top_right'), [promotions]);
  const gridBottomLeft = useMemo(() => promotions.find(p => p.position === 'grid_bottom_left'), [promotions]);
  const gridBottomRight = useMemo(() => promotions.find(p => p.position === 'grid_bottom_right'), [promotions]);

  if (productsLoading || promotionsLoading) {
    return (
      <div className="space-y-8 sm:space-y-12">
        <Skeleton className="h-[30vh] sm:h-[40vh] w-full rounded-lg" />
        <Skeleton className="h-12 sm:h-16 w-full" />
        {[...Array(4)].map((_, i) => (
          <section key={i}>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <Skeleton className="h-7 sm:h-8 w-2/5 sm:w-1/3" />
              <Skeleton className="h-7 sm:h-8 w-20 sm:w-24" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-60 sm:h-72 w-full rounded-lg" />)}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Full Width Banner */}
      <section aria-labelledby="banner-heading" className="w-full">
        <h2 id="banner-heading" className="sr-only">Promoções e Destaques</h2>
        <Banner promotions={mainCarouselPromotions} />
      </section>

      {/* Container for the rest of the content */}
      <div className="container mx-auto px-4 space-y-8 sm:space-y-12 pb-8">




        <section aria-labelledby="new-releases-heading">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 id="new-releases-heading" className="font-headline text-2xl sm:text-3xl font-semibold text-foreground uppercase">Lançamentos</h2>
            <Link href="/products?tag=lancamentos" passHref>
              <Button variant="ghost" className="text-primary hover:text-primary/90 text-xs sm:text-sm px-2 sm:px-3">
                Ver Todos <ChevronRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                  loop: newReleaseProducts.length > carouselLoopThreshold,
                }}
                onMouseEnter={newReleasesPlugin.current.stop}
                onMouseLeave={newReleasesPlugin.current.reset}
              >
                <CarouselContent className="-ml-2 sm:-ml-4">
                  {newReleaseProducts.map((product: Product) => (
                    <CarouselItem key={product.id} className="pl-2 sm:pl-4 basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <div className="h-full p-0.5 sm:p-1">
                        <ProductCard product={product} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-10px] sm:left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
                <CarouselNext className="absolute right-[-10px] sm:right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
              </Carousel>
              <CarouselDots api={apiNewReleases} onDotClick={handleNewReleasesDotClick} />
            </>
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base">Nenhum lançamento encontrado.</p>
          )}
        </section>

        <section aria-labelledby="best-selling-products-heading">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 id="best-selling-products-heading" className="font-headline text-2xl sm:text-3xl font-semibold text-foreground uppercase">Mais Vendidos</h2>
            <Link href="/products?filter=best-sellers" passHref>
              <Button variant="ghost" className="text-primary hover:text-primary/90 text-xs sm:text-sm px-2 sm:px-3">
                Ver Todos <ChevronRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                  loop: bestSellingProducts.length > carouselLoopThreshold,
                }}
                onMouseEnter={bestSellersPlugin.current.stop}
                onMouseLeave={bestSellersPlugin.current.reset}
              >
                <CarouselContent className="-ml-2 sm:-ml-4">
                  {bestSellingProducts.map((product: Product) => (
                    <CarouselItem key={product.id} className="pl-2 sm:pl-4 basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <div className="h-full p-0.5 sm:p-1">
                        <ProductCard product={product} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-10px] sm:left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
                <CarouselNext className="absolute right-[-10px] sm:right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
              </Carousel>
              <CarouselDots api={apiBestSellers} onDotClick={handleBestSellersDotClick} />
            </>
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base">Nenhum produto mais vendido encontrado.</p>
          )}
        </section>

        <section aria-labelledby="featured-categories-heading">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 id="featured-categories-heading" className="font-headline text-2xl sm:text-3xl font-semibold text-foreground uppercase">Destaques da loja</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* GRID LEFT (LARGE VERTICAL) */}
            <Link href={gridLeft?.link || "/products?category=GANHO%20DE%20MASSA"} passHref>
              <div className="group relative aspect-[3/4] sm:aspect-video md:aspect-[3/4] overflow-hidden rounded-lg border border-border/40 hover:border-border/70 shadow-none transition-all duration-300 cursor-pointer">
                <Image
                  src={gridLeft?.imageUrl || "https://placehold.co/600x800.png?text=Destaque+Esquerda"}
                  alt={gridLeft?.title || "Destaque"}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 group-hover:scale-105 brightness-50 group-hover:brightness-75"
                  data-ai-hint="muscle fitness torso"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-6 text-center">
                  <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-primary uppercase shadow-md mb-2 sm:mb-3">
                    {gridLeft?.title || "GANHO DE MASSA"}
                  </h3>
                  <Button variant="secondary" size="sm" className="bg-neutral-800/80 hover:bg-neutral-900/90 text-white px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm">Ver Agora</Button>
                </div>
              </div>
            </Link>

            <div className="grid grid-rows-2 gap-3 sm:gap-4 md:gap-6">
              {/* GRID TOP RIGHT (WIDE) */}
              <Link href={gridTopRight?.link || "/products?category=ENDURANCE"} passHref>
                <div className="group relative h-full w-full overflow-hidden rounded-lg border border-border/40 hover:border-border/70 shadow-none transition-all duration-300 cursor-pointer">
                  <Image
                    src={gridTopRight?.imageUrl || "https://placehold.co/800x400.png?text=Destaque+Topo"}
                    alt={gridTopRight?.title || "Destaque"}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105 brightness-50 group-hover:brightness-75"
                    data-ai-hint="runner motion"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-3 sm:p-4 text-center">
                    <h3 className="font-headline text-xl sm:text-2xl md:text-3xl font-bold text-primary uppercase shadow-md mb-1.5 sm:mb-2">
                      {gridTopRight?.title || "ENDURANCE"}
                    </h3>
                    <Button variant="secondary" size="sm" className="bg-neutral-800/80 hover:bg-neutral-900/90 text-white px-3 sm:px-5 py-1 sm:py-1.5 text-xs sm:text-sm">Ver Agora</Button>
                  </div>
                </div>
              </Link>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 h-full">
                {/* GRID BOTTOM LEFT */}
                <Link href={gridBottomLeft?.link || "/products?category=EMAGRECIMENTO"} passHref>
                  <div className="group relative h-full w-full overflow-hidden rounded-lg border border-border/40 hover:border-border/70 shadow-none transition-all duration-300 cursor-pointer">
                    <Image
                      src={gridBottomLeft?.imageUrl || "https://placehold.co/400x400.png?text=Peq+Esq"}
                      alt={gridBottomLeft?.title || "Destaque"}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 group-hover:scale-105 brightness-50 group-hover:brightness-75"
                      data-ai-hint="waist measure fitness"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-2 sm:p-3 text-center">
                      <h3 className="font-headline text-lg sm:text-xl md:text-2xl font-bold text-primary uppercase shadow-md mb-1 sm:mb-2">
                        {gridBottomLeft?.title || "EMAGRECIMENTO"}
                      </h3>
                      <Button variant="secondary" size="sm" className="bg-neutral-800/80 hover:bg-neutral-900/90 text-white px-2.5 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-xs h-7">Ver Agora</Button>
                    </div>
                  </div>
                </Link>

                {/* GRID BOTTOM RIGHT */}
                <Link href={gridBottomRight?.link || "/products?category=DEFINIÇÃO"} passHref>
                  <div className="group relative h-full w-full overflow-hidden rounded-lg border border-border/40 hover:border-border/70 shadow-none transition-all duration-300 cursor-pointer">
                    <Image
                      src={gridBottomRight?.imageUrl || "https://placehold.co/400x400.png?text=Peq+Dir"}
                      alt={gridBottomRight?.title || "Destaque"}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 group-hover:scale-105 brightness-50 group-hover:brightness-75"
                      data-ai-hint="abs fitness definition"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-2 sm:p-3 text-center">
                      <h3 className="font-headline text-lg sm:text-xl md:text-2xl font-bold text-primary uppercase shadow-md mb-1 sm:mb-2">
                        {gridBottomRight?.title || "DEFINIÇÃO"}
                      </h3>
                      <Button variant="secondary" size="sm" className="bg-neutral-800/80 hover:bg-neutral-900/90 text-white px-2.5 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-xs h-7">Ver Agora</Button>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <BrandCarousel />

        <section aria-labelledby="on-sale-products-heading">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 id="on-sale-products-heading" className="font-headline text-2xl sm:text-3xl font-semibold text-foreground uppercase">Em Promoção</h2>
            <Link href="/products?filter=on-sale" passHref>
              <Button variant="ghost" className="text-primary hover:text-primary/90 text-xs sm:text-sm px-2 sm:px-3">
                Ver Todos <ChevronRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                  loop: onSaleProducts.length > carouselLoopThreshold,
                }}
                onMouseEnter={onSaleProductsPlugin.current.stop}
                onMouseLeave={onSaleProductsPlugin.current.reset}
              >
                <CarouselContent className="-ml-2 sm:-ml-4">
                  {onSaleProducts.map((product: Product) => (
                    <CarouselItem key={product.id} className="pl-2 sm:pl-4 basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <div className="h-full p-0.5 sm:p-1">
                        <ProductCard product={product} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-10px] sm:left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
                <CarouselNext className="absolute right-[-10px] sm:right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
              </Carousel>
              <CarouselDots api={apiOnSale} onDotClick={handleOnSaleDotClick} />
            </>
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base">Nenhum produto em promoção encontrado.</p>
          )}
        </section>

        <section aria-labelledby="call-to-action-heading" className="py-8 sm:py-12 bg-card rounded-lg border border-border/40 shadow-none">
          <div className="container mx-auto text-center px-3 sm:px-4">
            <h2 id="call-to-action-heading" className="font-headline text-2xl sm:text-3xl font-semibold text-primary mb-3 sm:mb-4 uppercase">Pronto para Elevar seu Treino?</h2>
            <p className="text-sm sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-md sm:max-w-xl mx-auto">
              Descubra nossa linha completa de suplementos e alcance seus objetivos de performance e saúde.
            </p>
            <Link href="/products" passHref>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 sm:px-10 py-3 sm:py-4 rounded-md transition-transform duration-150 ease-in-out hover:scale-105 text-sm sm:text-base">
                Explorar Produtos
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <InfoBar />
    </div>
  );
}



