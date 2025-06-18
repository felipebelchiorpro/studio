
"use client";

import React from 'react';
import { Banner } from "@/components/Banner";
import ProductCard from "@/components/ProductCard";
import { mockProducts, mockCategories, mockPromotions, mainDropdownCategories } from "@/data/mockData";
import type { Product, Category, DropdownCategory as MainDropdownCategoryType } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu as MenuIcon, ChevronDown } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuGroup,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";

export default function HomePage() {
  const featuredProducts = mockProducts.slice(0, 4);
  const topLevelCategories = mockCategories;

  return (
    <div className="space-y-12">
      {/* Category Menu Section */}
      <section aria-labelledby="category-menu-heading" className="mb-8">
        <h2 id="category-menu-heading" className="sr-only">Navegar por Categorias</h2>
        <div className="bg-card py-2.5"> {/* Bar background */}
          <div className="container mx-auto px-2 flex items-center space-x-2">
            {/* Dropdown Menu for "CATEGORIAS" */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="uppercase text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 sm:px-4 py-2 sm:py-2.5 h-auto flex items-center whitespace-nowrap">
                  <MenuIcon className="h-4 w-4 mr-2" />
                  CATEGORIAS
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-background border-border shadow-lg" align="start">
                <DropdownMenuLabel className="font-semibold text-foreground">Principais Categorias</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                {mainDropdownCategories.map((mainCat: MainDropdownCategoryType) => (
                  mainCat.hasSubmenu && mainCat.subItems ? (
                    <DropdownMenuSub key={mainCat.id}>
                      <DropdownMenuSubTrigger className="text-foreground hover:bg-muted focus:bg-muted">
                        <span>{mainCat.name}</span>
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="bg-background border-border shadow-lg text-foreground">
                          {mainCat.href && ( // Option to view all in parent category
                            <Link href={mainCat.href} passHref>
                              <DropdownMenuItem className="hover:bg-muted focus:bg-muted">
                                Ver Tudo em {mainCat.name}
                              </DropdownMenuItem>
                            </Link>
                          )}
                          {mainCat.subItems.map(subItem => (
                            <Link key={subItem.id} href={subItem.href} passHref>
                              <DropdownMenuItem className="hover:bg-muted focus:bg-muted">
                                {subItem.name}
                              </DropdownMenuItem>
                            </Link>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  ) : (
                    <Link key={mainCat.id} href={mainCat.href || "/products"} passHref>
                      <DropdownMenuItem className="text-foreground hover:bg-muted focus:bg-muted">
                        {mainCat.name}
                      </DropdownMenuItem>
                    </Link>
                  )
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Container for horizontal scrollable categories, aligned left */}
            <div className="flex-1 flex items-center overflow-x-auto whitespace-nowrap space-x-1 md:space-x-2 min-w-0">
              {topLevelCategories.map((category: Category) => {
                const isComboOffer = category.id === "catComboOffers";
                const buttonClassName = isComboOffer
                  ? "uppercase text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 sm:px-5 py-1.5 sm:py-2 h-auto whitespace-nowrap flex items-center transition-all duration-150 ease-in-out"
                  : "uppercase text-xs sm:text-sm font-medium text-foreground hover:text-primary hover:bg-transparent px-2 sm:px-3 py-1.5 h-auto whitespace-nowrap flex items-center";
                
                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${encodeURIComponent(category.name)}`}
                    passHref
                  >
                    <Button
                      variant="ghost"
                      className={buttonClassName}
                    >
                      {category.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="banner-heading">
        <h2 id="banner-heading" className="sr-only">Promoções e Destaques</h2>
        <Banner promotions={mockPromotions} />
      </section>

      <section aria-labelledby="featured-categories-heading">
        <div className="flex justify-between items-center mb-6">
          <h2 id="featured-categories-heading" className="font-headline text-3xl font-semibold text-foreground uppercase">Categorias em Destaque</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {mockCategories.filter(cat => cat.id !== "catComboOffers").slice(0, 4).map((category: Category) => (
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
                  <h3 className="font-headline text-lg md:text-xl font-bold text-white text-center uppercase">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="featured-products-heading">
        <div className="flex justify-between items-center mb-6">
          <h2 id="featured-products-heading" className="font-headline text-3xl font-semibold text-foreground uppercase">Produtos Populares</h2>
          <Link href="/products" passHref>
            <Button variant="ghost" className="text-primary hover:text-primary/90">
              Ver Todas <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
