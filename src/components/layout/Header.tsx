"use client";

import Link from 'next/link';
import { ShoppingCart, UserCircle, Search, Menu as MenuIcon, LogIn, LayoutDashboard, Home, Package, Info, X, ChevronDown, ChevronRight, CreditCard, Phone, Mail, Instagram, Youtube, MessageCircle, ChevronLeft, Heart, User as UserIcon } from 'lucide-react';
import { CartSheet } from "@/components/CartSheet";
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext'; // Changed to useCustomerAuth
import React, { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
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
  DropdownMenuGroup
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

// Forced Rebuild Comment to fix Hydration
export default function Header() {
  const { getCartItemCount } = useCart();
  const { isCustomerAuthenticated, customerLogout, customer } = useCustomerAuth(); // Changed
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
    }, 5000);
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

  /* const topLevelCategories = mockCategories; */ // Replaced by simple state
  const [topLevelCategories, setTopLevelCategories] = useState<TopCategoryType[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { fetchCategoriesService } = await import('@/services/categoryService');
        const data = await fetchCategoriesService();
        setTopLevelCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        // Fallback or leave empty
      }
    };
    loadCategories();
  }, []);

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
        <div className="container mx-auto flex h-8 items-center justify-between px-2 sm:px-4 text-[10px] sm:text-xs md:text-sm">
          <Button variant="ghost" size="icon" onClick={handlePrevMessage} className="h-full px-1 sm:px-2 hover:bg-primary/80">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous message</span>
          </Button>
          <div className="flex items-center text-center overflow-hidden whitespace-nowrap">
            <CurrentMessageIcon className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{topBarMessages[currentMessageIndex].text}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextMessage} className="h-full px-1 sm:px-2 hover:bg-primary/80">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next message</span>
          </Button>
        </div>
      </div>

      {/* Dark Contact Bar */}
      <div className="bg-background text-card-foreground border-b border-border/40 py-1.5 sm:py-2">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between px-4 text-[10px] sm:text-xs">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-0 flex-wrap justify-center">
            <a href="https://wa.me/5519971120949" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary transition-colors">
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-primary" /> WhatsApp: (19) 97112-0949
            </a>
            <a href="mailto:contato@darkstoresuplementos.com" className="flex items-center hover:text-primary transition-colors">
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-primary" /> contato@darkstoresuplementos.com
            </a>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link href="/about" className="hover:text-primary transition-colors">Sobre Nós</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Fale Conosco</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={14} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors"><Youtube size={14} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Upper Header Part - Logo, Search, Auth, Cart */}
      <div className="bg-background border-b border-border/40">
        <div className="container mx-auto flex h-[72px] sm:h-[88px] items-center justify-between px-4 space-x-2 sm:space-x-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0" aria-label="DarkStore Suplementos Home">
            <Image
              src="/darkstore-logo.png"
              alt="DarkStore Suplementos Logo"
              width={150}
              height={37}
              className="object-contain sm:w-[180px] sm:h-[44px]"
              priority
            />
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-grow max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Auth & Cart Links - Desktop */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
            {isCustomerAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center text-sm font-medium hover:text-primary gap-2">
                    <UserIcon className="h-6 w-6" />
                    <span>Olá, {customer?.name?.split(' ')[0] || 'Cliente'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-lg">
                  <DropdownMenuLabel className="font-semibold text-foreground">Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem asChild>
                    <Link href="/account/dashboard" className="cursor-pointer flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-primary" /> Painel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders" className="cursor-pointer flex items-center"> {/* Placeholder */}
                      <Package className="mr-2 h-4 w-4 text-primary" /> Meus Pedidos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={customerLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive-foreground cursor-pointer flex items-center">
                    <LogIn className="mr-2 h-4 w-4 transform rotate-180" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/account/login" className="flex items-center gap-2 hover:text-primary transition-colors">
                <UserCircle className="h-6 w-6" />
                <span className="font-medium text-sm">Login</span>
              </Link>
            )}

            <Link href="/account/favorites" className="hover:text-primary transition-colors" aria-label="Favoritos">
              <Heart className="h-6 w-6" />
            </Link>

            <CartSheet />
          </div>

          {/* Mobile: Cart and Menu Trigger */}
          <div className="md:hidden flex items-center">
            <CartSheet />
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menu" className="text-primary">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[320px] bg-background p-0 flex flex-col">
                <SheetTitle className="sr-only">Menu de Navegação Principal</SheetTitle>
                <SheetDescription className="sr-only">Acesse as categorias, carrinho e sua conta.</SheetDescription>

                {/* Header do Menu */}
                <div className="p-4 sm:p-6 border-b border-border/40 flex justify-between items-center">
                  <Link href="/" className="flex items-center" onClick={closeSheet}>
                    <Image
                      src="/darkstore-logo.png"
                      alt="DarkStore Suplementos Logo"
                      width={120}
                      height={30}
                      className="object-contain"
                    />
                  </Link>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Fechar menu" className="text-muted-foreground hover:text-primary">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                </div>

                <div className="flex-grow overflow-y-auto">
                  {/* Área do Usuário */}
                  <div className="p-4 bg-muted/30">
                    {isCustomerAuthenticated ? (
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-3 text-foreground">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Olá, {customer?.name?.split(' ')[0]}</p>
                            <p className="text-xs text-muted-foreground">Bem-vindo de volta!</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Link href="/account/dashboard" onClick={closeSheet}>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8">
                              <LayoutDashboard className="mr-1.5 h-3 w-3" /> Painel
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" className="w-full text-xs h-8 text-destructive hover:text-destructive" onClick={() => { customerLogout(); closeSheet(); }}>
                            <LogIn className="mr-1.5 h-3 w-3 transform rotate-180" /> Sair
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-3">
                        <Link href="/account/login" onClick={closeSheet} className="w-full">
                          <Button className="w-full">Entrar ou Cadastrar</Button>
                        </Link>
                        <p className="text-xs text-center text-muted-foreground">Acesse seus pedidos e perfil.</p>
                      </div>
                    )}
                  </div>

                  {/* Busca e Navegação */}
                  <div className="p-4 space-y-6">
                    <SearchBar onSearch={handleSearch} />

                    <nav className="flex flex-col space-y-1">
                      {mainSiteLinks.map(link => (
                        <Link key={link.href} href={link.href} onClick={closeSheet}>
                          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group">
                            <div className="flex items-center text-sm font-medium text-foreground group-hover:text-primary">
                              {link.icon} <span className="ml-3">{link.label}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          </div>
                        </Link>
                      ))}

                    </nav>
                  </div>
                </div>

                {/* Footer do Menu */}
                <div className="p-4 border-t border-border/40 bg-muted/10">
                  <a href="https://wa.me/5519971120949" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white">
                      <MessageCircle className="mr-2 h-4 w-4" /> Fale no WhatsApp
                    </Button>
                  </a>
                  <div className="flex justify-center space-x-6 mt-4 opacity-70">
                    <a href="#" className="hover:text-primary transition-colors"><Instagram size={20} /></a>
                    <a href="#" className="hover:text-primary transition-colors"><Youtube size={20} /></a>
                    <a href="mailto:contato@darkstoresuplementos.com" className="hover:text-primary transition-colors"><Mail size={20} /></a>
                  </div>
                </div>

              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mega Menu Navigation */}
      <nav className="bg-background border-b border-border/40 hidden md:block relative z-40">
        <div className="container mx-auto flex justify-center items-center h-14">
          {/* Main UL - Flex container affecting all top-level items */}
          <ul className="flex items-center space-x-8 h-full">




            {/* SUPLEMENTOS - Mega Menu Trigger */}
            <li className="group h-full flex items-center">
              <Link href="/products" className="h-full flex items-center px-2 font-bold text-sm hover:text-primary transition-colors uppercase tracking-wide">
                Suplementos <ChevronDown className="ml-1 h-3 w-3 group-hover:rotate-180 transition-transform duration-200" />
              </Link>

              <div className="absolute left-0 top-full w-full bg-background border-t border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                <div className="container mx-auto py-8 px-4">
                  <div className="grid grid-cols-4 lg:grid-cols-5 gap-8">
                    {(() => {
                      // Filter for root categories (no parentId) and type supplement (or default)
                      const roots = topLevelCategories.filter(c => !c.parentId && (c.type === 'supplement' || !c.type));

                      if (topLevelCategories.length === 0) {
                        return (
                          <div className="col-span-5 flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <p>Nenhuma categoria encontrada.</p>
                            <p className="text-xs mt-1">Cadastre categorias no painel para que elas apareçam aqui.</p>
                          </div>
                        );
                      }

                      return roots.map((root) => {
                        // Find children for this root
                        const children = topLevelCategories.filter(c => c.parentId === root.id);

                        return (
                          <div key={root.id}>
                            <Link href={`/products?category=${encodeURIComponent(root.name)}`} className="font-bold mb-4 text-foreground text-sm border-b border-border/50 pb-2 uppercase tracking-wide block hover:text-primary">
                              {root.name}
                            </Link>
                            {children.length > 0 && (
                              <ul className="space-y-2">
                                {children.map((child) => (
                                  <li key={child.id}>
                                    <Link href={`/products?category=${encodeURIComponent(child.name)}`} className="text-sm text-muted-foreground hover:text-primary transition-colors block py-0.5">
                                      {child.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </li>

            {/* VESTUÁRIO - Mega Menu - DYNAMIC */}
            <li className="group h-full flex items-center">
              <Link href="/products?category=ROUPAS" className="h-full flex items-center px-2 font-bold text-sm hover:text-primary transition-colors uppercase tracking-wide">
                Vestuário <ChevronDown className="ml-1 h-3 w-3 group-hover:rotate-180 transition-transform duration-200" />
              </Link>
              <div className="absolute left-0 top-full w-full bg-background border-t border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                <div className="container mx-auto py-8 px-4">
                  <div className="grid grid-cols-4 lg:grid-cols-5 gap-8">
                    {(() => {
                      // Filter for Clothing categories
                      const clothingRoots = topLevelCategories.filter(c => (!c.parentId && c.type === 'clothing'));

                      if (clothingRoots.length === 0) {
                        return (
                          <div className="col-span-5 flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <p>Nenhuma categoria de vestuário encontrada.</p>
                            <p className="text-xs mt-1">Cadastre categorias do tipo 'Vestuário' no painel.</p>
                          </div>
                        );
                      }

                      return clothingRoots.map((root) => {
                        const children = topLevelCategories.filter(c => c.parentId === root.id);
                        return (
                          <div key={root.id}>
                            <Link href={`/products?category=${encodeURIComponent(root.name)}`} className="font-bold mb-4 text-foreground text-sm border-b border-border/50 pb-2 uppercase tracking-wide block hover:text-primary">
                              {root.name}
                            </Link>
                            {children.length > 0 && (
                              <ul className="space-y-2">
                                {children.map((child) => (
                                  <li key={child.id}>
                                    <Link href={`/products?category=${encodeURIComponent(child.name)}`} className="text-sm text-muted-foreground hover:text-primary transition-colors block py-0.5">
                                      {child.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </li>

            {/* OUTLET / PROMO */}
            <li className="h-full flex items-center">
              <Link href="/products?filter=on-sale" className="h-full flex items-center px-2 font-bold text-sm hover:text-primary transition-colors uppercase tracking-wide">
                Outlet
              </Link>
            </li>

            {/* KITS */}
            <li className="h-full flex items-center">
              <Link href="/products?category=KITS" className="h-full flex items-center px-2 font-bold text-sm hover:text-primary transition-colors uppercase tracking-wide">
                Kits
              </Link>
            </li>

            {/* LANÇAMENTOS */}
            <li className="h-full flex items-center">
              <Link href="/products?tag=new" className="h-full flex items-center px-2 font-bold text-sm hover:text-primary transition-colors uppercase tracking-wide">
                Lançamentos
              </Link>
            </li>



          </ul>
        </div>
      </nav>

    </header>
  );
}
