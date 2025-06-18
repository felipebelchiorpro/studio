
"use client";

import Link from 'next/link';
import { ShoppingCart, UserCircle, Search, Menu as MenuIcon, LogIn, LayoutDashboard, Home, Package, Info, X, ChevronDown, ChevronRight, CreditCard, Phone, Mail, Instagram, Youtube, MessageCircle, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import React, { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { mockCategories, mainDropdownCategories } from "@/data/mockData";
import type { Category as TopCategoryType, DropdownCategory } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from 'next/image';


const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href} passHref>
      <Button
        variant="ghost"
        className={`text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-foreground'}`}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
      >
        {children}
      </Button>
    </Link>
  );
};

const topBarMessages = [
  { text: "Parcelamento em até 3x sem juros!", icon: CreditCard },
  { text: "Frete Grátis acima de R$199 para todo Brasil!", icon: ShoppingCart },
  { text: "Novidades toda semana, confira!", icon: Info },
];

export default function Header() {
  const { getCartItemCount } = useCart();
  const { isAuthenticated, logout } = useAuth(); // user removed as it's not used directly here
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [mainMenuOpen, setMainMenuOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    setCartItemCount(getCartItemCount());
  }, [getCartItemCount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % topBarMessages.length);
    }, 5000); // Change message every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const handlePrevMessage = () => {
    setCurrentMessageIndex((prevIndex) => (prevIndex - 1 + topBarMessages.length) % topBarMessages.length);
  };

  const handleNextMessage = () => {
    setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % topBarMessages.length);
  };


  const mainSiteLinks = [
    { href: '/', label: 'Home', icon: <Home className="mr-2 h-4 w-4" /> },
    { href: '/products', label: 'Produtos', icon: <Package className="mr-2 h-4 w-4" /> },
    { href: '/about', label: 'Sobre Nós', icon: <Info className="mr-2 h-4 w-4" /> },
  ];

  const closeSheet = () => setIsSheetOpen(false);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      closeSheet();
    }
  };

  const topLevelCategories = mockCategories;

  const handleMainMenuEnter = () => {
    setMainMenuOpen(true);
  };

  const handleMainMenuLeave = () => {
    setMainMenuOpen(false);
  };
  
  const handleMenuItemClick = () => {
    setMainMenuOpen(false);
  };

  const CurrentMessageIcon = topBarMessages[currentMessageIndex].icon;


  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Red Top Bar Marquee */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex h-8 items-center justify-between px-4 text-xs sm:text-sm">
          <Button variant="ghost" size="icon" onClick={handlePrevMessage} className="h-full px-2 hover:bg-primary/80">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous message</span>
          </Button>
          <div className="flex items-center text-center">
            <CurrentMessageIcon className="mr-2 h-4 w-4" />
            <span>{topBarMessages[currentMessageIndex].text}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextMessage} className="h-full px-2 hover:bg-primary/80">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next message</span>
          </Button>
        </div>
      </div>

      {/* Dark Contact Bar */}
      <div className="bg-background text-card-foreground border-b border-border/40 py-2">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between px-4 text-xs">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-0">
            <a href="https://wa.me/5514997326263" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary transition-colors">
              <MessageCircle className="h-4 w-4 mr-1 text-primary" /> WhatsApp: (14) 99732-6263
            </a>
            <a href="tel:+5514997326263" className="flex items-center hover:text-primary transition-colors">
              <Phone className="h-4 w-4 mr-1 text-primary" /> (14) 99732-6263
            </a>
            <a href="mailto:contato@sportzonesupp.com" className="flex items-center hover:text-primary transition-colors">
              <Mail className="h-4 w-4 mr-1 text-primary" /> contato@sportzonesupp.com
            </a>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link href="/about" className="hover:text-primary transition-colors">Sobre Nós</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Fale Conosco</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <div className="flex items-center space-x-2">
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={16} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors"><Youtube size={16} /></a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upper Header Part - Logo, Search, Auth, Cart */}
      <div className="bg-background border-b border-border/40">
        <div className="container mx-auto flex h-[88px] items-center justify-between px-4 space-x-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0" aria-label="DarkStore Suplementos Home">
             <Image
                src="/darkstore-logo.png" 
                alt="DarkStore Suplementos Logo"
                width={180} 
                height={44} 
                className="object-contain"
                priority 
              />
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-grow max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Auth & Cart Links - Desktop */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="flex items-center text-sm text-white hover:text-primary">
                  <LayoutDashboard className="h-5 w-5 mr-2 text-primary" />
                  Minha Conta
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:text-primary text-sm">
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center text-sm text-white hover:text-primary">
                  <UserCircle className="h-5 w-5 mr-1 text-primary" />
                  Cadastre-se
                </Link>
                <span className="text-sm text-gray-400">|</span>
                <Link href="/login" className="text-sm text-white hover:text-primary">
                  Fazer login
                </Link>
              </>
            )}
            <Link href="/cart" passHref>
              <Button variant="ghost" size="icon" className="relative text-primary hover:text-primary/80" aria-label={`Carrinho com ${cartItemCount} itens`}>
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground transform translate-x-1/3 -translate-y-1/3">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile: Cart and Menu Trigger */}
          <div className="md:hidden flex items-center">
            <Link href="/cart" passHref>
              <Button variant="ghost" size="icon" className="mr-2 text-primary hover:text-primary/80" aria-label={`Carrinho com ${cartItemCount} itens`}>
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menu" className="text-primary">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <Link href="/" className="flex items-center" onClick={closeSheet}>
                     <Image
                        src="/darkstore-logo.png" 
                        alt="DarkStore Suplementos Logo"
                        width={150}
                        height={37} 
                        className="object-contain"
                      />
                  </Link>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Fechar menu" className="text-primary">
                      <X className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                </div>
                
                <div className="mb-6">
                  <SearchBar onSearch={handleSearch} />
                </div>

                <nav className="flex flex-col space-y-3 flex-grow">
                  {mainSiteLinks.map(link => (
                    <NavLink key={link.href} href={link.href} onClick={closeSheet}>
                      {link.icon} {link.label}
                    </NavLink>
                  ))}
                </nav>
                
                <hr className="my-3 border-border" />

                <div className="space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link href="/dashboard" passHref>
                        <Button variant="ghost" className="w-full justify-start text-foreground" onClick={closeSheet}>
                          <LayoutDashboard className="mr-2 h-4 w-4 text-primary" /> Minha Conta
                        </Button>
                      </Link>
                      <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive" onClick={() => { logout(); closeSheet(); }}>
                        <LogIn className="mr-2 h-4 w-4 transform rotate-180" /> Sair
                      </Button>
                    </>
                  ) : (
                    <>
                     <Link href="/login" passHref>
                        <Button variant="ghost" className="w-full justify-start text-foreground" onClick={closeSheet}>
                          <UserCircle className="mr-2 h-4 w-4 text-primary" /> Cadastre-se
                        </Button>
                      </Link>
                      <Link href="/login" passHref>
                        <Button variant="ghost" className="w-full justify-start text-foreground" onClick={closeSheet}>
                          <LogIn className="mr-2 h-4 w-4 text-primary" /> Fazer login
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Lower Header Part (Category Navigation) */}
      <nav aria-labelledby="category-menu-heading" className="bg-card py-2.5 border-b border-border/40">
        <h2 id="category-menu-heading" className="sr-only">Navegar por Categorias</h2>
        <div className="container mx-auto px-2 flex items-center space-x-2">
           <div
              className="relative"
              onMouseLeave={handleMainMenuLeave}
            >
              <DropdownMenu open={mainMenuOpen} onOpenChange={setMainMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="uppercase text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 sm:px-4 py-2 sm:py-2.5 h-auto flex items-center whitespace-nowrap"
                    onMouseEnter={handleMainMenuEnter}
                  >
                    <MenuIcon className="h-4 w-4 mr-2" />
                    CATEGORIAS
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-64 bg-background border-border shadow-lg"
                  onMouseEnter={handleMainMenuEnter} 
                >
                  <DropdownMenuLabel className="font-semibold text-foreground">Principais Categorias</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  {mainDropdownCategories.map((mainCat: DropdownCategory) => (
                     <Link key={mainCat.id} href={mainCat.href || `/products?category=${encodeURIComponent(mainCat.name)}`} passHref>
                        <DropdownMenuItem
                          className="text-foreground hover:bg-muted focus:bg-muted"
                          onClick={handleMenuItemClick}
                        >
                          {mainCat.name}
                        </DropdownMenuItem>
                      </Link>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1 flex justify-start items-center overflow-x-auto whitespace-nowrap space-x-1 md:space-x-2 min-w-0">
              {topLevelCategories.map((category: TopCategoryType) => {
                const isComboOffer = category.id === "catComboOffers";
                const buttonClassName = `uppercase text-xs sm:text-sm font-semibold rounded-full px-4 sm:px-5 py-1.5 sm:py-2 h-auto whitespace-nowrap flex items-center transition-all duration-150 ease-in-out ${
                  isComboOffer
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-foreground hover:text-primary bg-transparent hover:bg-transparent"
                }`;

                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${encodeURIComponent(category.name)}`}
                    passHref
                  >
                    <Button
                      variant={isComboOffer ? "default": "ghost"}
                      className={buttonClassName}
                    >
                      {category.name.toUpperCase()}
                    </Button>
                  </Link>
                );
              })}
            </div>
        </div>
      </nav>
    </header>
  );
}

