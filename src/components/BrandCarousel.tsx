"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useBrand } from '@/context/BrandContext';

export default function BrandCarousel() {
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));
  const { getBrands } = useBrand();
  const brands = getBrands();

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="bg-card py-8 sm:py-12 border-y border-border/40">
      <div className="container mx-auto">
        <h2 className="font-headline text-2xl sm:text-3xl font-semibold text-foreground uppercase text-center mb-6 sm:mb-8">
          Trabalhamos com as melhores marcas
        </h2>
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          opts={{
            align: 'start',
            loop: true,
            dragFree: true,
          }}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent className="-ml-4">
            {brands.map((brand) => (
              <CarouselItem
                key={brand.id}
                className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <Link href={`/products?brands=${encodeURIComponent(brand.name)}`} passHref>
                  <div className="group cursor-pointer">
                    <Card className="overflow-hidden bg-white/90 hover:bg-white transition-colors duration-300">
                      <CardContent className="p-4 flex items-center justify-center aspect-[2/1]">
                        <div className="relative w-full h-full">
                          <Image
                            src={brand.imageUrl}
                            alt={brand.name}
                            layout="fill"
                            objectFit="contain"
                            className="grayscale group-hover:grayscale-0 transition-all duration-300"
                            data-ai-hint={`${brand.name.toLowerCase()} supplement logo`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-[-10px] sm:left-[-20px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
          <CarouselNext className="absolute right-[-10px] sm:right-[-20px] top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground border-border shadow-md hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
