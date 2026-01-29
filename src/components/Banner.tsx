
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
              <Card className="bg-card border-0 shadow-none rounded-none">
                <CardContent className="relative flex aspect-[16/10] md:aspect-[1920/492] items-center justify-center p-0">
                  {hasText ? (
                    // Layout with Overlay Text
                    <>
                      <Image
                        src={promotion.imageUrl}
                        alt={promotion.title}
                        layout="fill"
                        objectFit="cover"
                        className="brightness-75"
                        data-ai-hint="fitness promotion"
                      />
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
                    // Layout Image Only (Full Art)
                    promotion.link ? (
                      <Link href={promotion.link} className="relative w-full h-full block">
                        <Image
                          src={promotion.imageUrl}
                          alt={promotion.title || "Banner"}
                          layout="fill"
                          objectFit="cover"
                          className="" // No brightness filter for clean art
                          priority={true}
                        />
                      </Link>
                    ) : (
                      <Image
                        src={promotion.imageUrl}
                        alt={promotion.title || "Banner"}
                        layout="fill"
                        objectFit="cover"
                        className=""
                      />
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
