
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, BarChart3, Layers, LogOut, Settings, UserCircle, Edit, Tags, LayoutGrid, Truck } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from 'next/image';


const NavItem = ({ href, icon: Icon, label, currentPath, onClick }: { href: string; icon: React.ElementType; label: string; currentPath: string; onClick?: () => void; }) => {
  const isActive = currentPath === href || (href !== "/dashboard" && currentPath.startsWith(href));
  return (
    <Link href={href} passHref>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={`w-full justify-start text-sm ${isActive ? 'font-semibold text-primary' : 'text-foreground hover:bg-muted/50 hover:text-primary'}`}
        aria-current={isActive ? "page" : undefined}
        onClick={onClick}
      >
        <Icon className="mr-3 h-5 w-5" />
        {label}
      </Button>
    </Link>
  );
};

interface DashboardNavProps {
  onNavItemClick?: () => void; // Optional callback for when a nav item is clicked (e.g., to close mobile sheet)
}

export default function DashboardNav({ onNavItemClick }: DashboardNavProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
    if (onNavItemClick) onNavItemClick();
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Visão Geral' },
    { href: '/dashboard/products', icon: Package, label: 'Gerenciar Produtos' },
    { href: '/dashboard/sales', icon: BarChart3, label: 'Relatório de Vendas' },
    { href: '/dashboard/stock', icon: Layers, label: 'Controle de Estoque' },
    { href: '/dashboard/quick-edit', icon: Edit, label: 'Edição Rápida' },
    { href: '/dashboard/categories', icon: LayoutGrid, label: 'Gerenciar Categorias' },
    { href: '/dashboard/brands', icon: Tags, label: 'Gerenciar Marcas' },
    { href: '/dashboard/shipping/pack-station', icon: Truck, label: 'Estação de Embalagem' }, 
  ];

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  return (
    // Adjusted classes for use in both fixed desktop sidebar and mobile sheet
    <aside className="w-full md:w-64 h-full bg-card border-r-0 md:border-r md:border-border/60 p-4 flex flex-col">
      {/* Logo for mobile sheet header */}
      <div className="md:hidden p-4 mb-2 border-b border-border/60 flex justify-center">
        <Link href="/dashboard" onClick={onNavItemClick}>
            <Image
                src="/darkstore-logo.png" 
                alt="DarkStore Suplementos Logo"
                width={150} 
                height={37} 
                className="object-contain"
            />
        </Link>
      </div>

      <div className="p-4 mb-4 border-b border-border/60">
        <div className="flex items-center space-x-3">
           <Avatar className="h-10 w-10">
            <AvatarImage src={user?.email === "merchant@darkstore.com" ? "https://placehold.co/100x100.png" : undefined} alt={user?.name || "User"} data-ai-hint="user profile"/>
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {getInitials(user?.name || user?.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{user?.name || "Usuário"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-grow space-y-1">
        {navItems.map(item => (
          <NavItem key={item.href} {...item} currentPath={pathname} onClick={onNavItemClick}/>
        ))}
      </nav>
      <Separator className="my-4" />
      <Button
        variant="ghost"
        className="w-full justify-start text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={handleLogout}
      >
        <LogOut className="mr-3 h-5 w-5" />
        Sair
      </Button>
    </aside>
  );
}

