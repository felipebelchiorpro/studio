
"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import type { Promotion } from "@/types";

interface BannerProps {
  promotions: Promotion[];
}

export function Banner({ promotions }: BannerProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  if (!promotions || promotions.length === 0) {
    return null;
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full shadow-none"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      opts={{ loop: true }}
      aria-roledescription="carousel"
      aria-label="Destaques e promoções"
    >
      <CarouselContent>
        {promotions.map((promotion) => {
          const hasText = (promotion.title && promotion.title.trim().length > 1) || (promotion.description && promotion.description.trim().length > 1);

          return (
            <CarouselItem key={promotion.id}>
              <Card className="bg-card border-0 shadow-none rounded-none w-full">
                <CardContent className={`relative flex items-center justify-center p-0 w-full ${hasText ? 'aspect-[16/10] md:aspect-[1920/600]' : ''}`}>
                  {hasText ? (
                    // Layout with Overlay Text (Fixed Heights)
                    <>
                      {/* Mobile Image */}
                      <div className="md:hidden absolute inset-0">
                        <Image
                          src={promotion.mobileImageUrl || promotion.imageUrl}
                          alt={promotion.title}
                          fill
                          quality={90}
                          sizes="100vw"
                          className="object-cover brightness-75"
                        />
                      </div>
                      {/* Desktop Image */}
                      <div className="hidden md:block absolute inset-0">
                        <Image
                          src={promotion.imageUrl}
                          alt={promotion.title}
                          fill
                          quality={90}
                          sizes="100vw"
                          className="object-cover brightness-75"
                        />
                      </div>

                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center">
                        {promotion.title && <h2 className="font-headline text-3xl md:text-5xl font-bold text-white mb-4 shadow-md drop-shadow-lg">
                          {promotion.title}
                        </h2>}
                        {promotion.description && <p className="text-lg md:text-xl text-gray-100 mb-6 max-w-2xl shadow-sm drop-shadow-md font-medium">
                          {promotion.description}
                        </p>}
                        {promotion.link && (
                          <Link href={promotion.link} passHref>
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 rounded-md transition-transform duration-150 ease-in-out hover:scale-105 shadow-lg">
                              Ver Oferta
                            </Button>
                          </Link>
                        )}
                      </div>
                    </>
                  ) : (
                    // Layout Image Only (Dynamic Heights based on Original Image Aspect)
                    promotion.link ? (
                      <Link href={promotion.link} className="w-full h-auto block">
                        {/* Mobile Image Only - Next.js responsive image technique */}
                        <div className="md:hidden w-full h-auto block leading-none">
                          <img
                            src={promotion.mobileImageUrl || promotion.imageUrl}
                            alt={promotion.title || "Banner Oferta"}
                            className="w-full h-auto object-contain block"
                          />
                        </div>
                        {/* Desktop Image Only */}
                        <div className="hidden md:block w-full h-auto block leading-none">
                          <img
                            src={promotion.imageUrl}
                            alt={promotion.title || "Banner Oferta"}
                            className="w-full h-auto object-contain block"
                          />
                        </div>
                      </Link>
                    ) : (
                      <div className="w-full h-auto block">
                        <div className="md:hidden w-full h-auto block leading-none">
                          <img
                            src={promotion.mobileImageUrl || promotion.imageUrl}
                            alt={promotion.title || "Banner Oferta"}
                            className="w-full h-auto object-contain block"
                          />
                        </div>
                        <div className="hidden md:block w-full h-auto block leading-none">
                          <img
                            src={promotion.imageUrl}
                            alt={promotion.title || "Banner Oferta"}
                            className="w-full h-auto object-contain block"
                          />
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80 text-foreground" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80 text-foreground" />
    </Carousel>
  );
}
