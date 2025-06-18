
"use client";

import Link from 'next/link';
import { ShoppingCart, User, LogIn, LayoutDashboard, Home, Package, Info, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar'; // Importar SearchBar

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

export default function Header() {
  const { getCartItemCount } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter(); // Adicionar useRouter

  useEffect(() => {
    setCartItemCount(getCartItemCount());
  }, [getCartItemCount, isAuthenticated]);

  const navLinks = [
    { href: '/', label: 'Home', icon: <Home className="mr-2 h-4 w-4" /> },
    { href: '/products', label: 'Produtos', icon: <Package className="mr-2 h-4 w-4" /> },
    { href: '/about', label: 'Sobre Nós', icon: <Info className="mr-2 h-4 w-4" /> },
  ];

  const closeSheet = () => setIsSheetOpen(false);

  const handleHeaderSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      closeSheet(); // Fechar o sheet se a busca for iniciada do mobile
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" aria-label="DarkStore Suplementos Home">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-primary">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM19.535 7.595L12 11.655L4.465 7.595L12 3.535L19.535 7.595Z" />
          </svg>
          <span className="font-headline text-xl font-bold text-foreground">DarkStore</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {navLinks.map(link => <NavLink key={link.href} href={link.href}>{link.label}</NavLink>)}
        </nav>

        {/* Desktop Search and Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="w-full max-w-xs">
            <SearchBar onSearch={handleHeaderSearch} />
          </div>
          <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" aria-label={`Carrinho com ${cartItemCount} itens`}>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" passHref>
                <Button variant="ghost" size="icon" aria-label="Dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
                <LogIn className="h-5 w-5 transform rotate-180" />
              </Button>
            </>
          ) : (
            <Link href="/login" passHref>
              <Button variant="ghost" size="icon" aria-label="Login">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden flex items-center">
         <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" className="mr-2" aria-label={`Carrinho com ${cartItemCount} itens`}>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <Link href="/" className="flex items-center space-x-2" onClick={closeSheet}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-primary">
                      <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM19.535 7.595L12 11.655L4.465 7.595L12 3.535L19.535 7.595Z" />
                    </svg>
                    <span className="font-headline text-xl font-bold">DarkStore</span>
                  </Link>
                <SheetTrigger asChild>
                   <Button variant="ghost" size="icon" aria-label="Fechar menu">
                      <X className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
              </div>

              <div className="mb-6">
                <SearchBar onSearch={handleHeaderSearch} />
              </div>

              <nav className="flex flex-col space-y-3 flex-grow">
                {navLinks.map(link => (
                  <NavLink key={link.href} href={link.href} onClick={closeSheet}>
                    {link.icon} {link.label}
                  </NavLink>
                ))}
              </nav>
              
              <hr className="my-3 border-border" />

              <div className="mt-auto_ (remove this class if not needed, likely a typo)">
                 {/* Mobile cart button was removed from here because it's now outside the sheet trigger */}
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" passHref>
                       <Button variant="ghost" className="w-full justify-start text-foreground mb-2" onClick={closeSheet}>
                         <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                       </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive" onClick={() => { logout(); closeSheet(); }}>
                      <LogIn className="mr-2 h-4 w-4 transform rotate-180" /> Sair
                    </Button>
                  </>
                ) : (
                  <Link href="/login" passHref>
                    <Button variant="ghost" className="w-full justify-start text-foreground" onClick={closeSheet}>
                      <User className="mr-2 h-4 w-4" /> Login
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
