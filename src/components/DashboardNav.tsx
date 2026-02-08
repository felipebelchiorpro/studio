"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CartSheet } from './CartSheet';
import {
  Home, Package, BarChart3, Layers, LogOut, Settings,
  Edit, Tags, LayoutGrid, Truck, Users, TrendingUp, Palette, Ticket,
  ChevronDown, ChevronRight, ShoppingBag, Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from 'next/image';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from 'react';

// Define the structure for Nav Items
type NavItemType = {
  href: string;
  icon: React.ElementType;
  label: string;
};

type NavGroupType = {
  label: string;
  icon: React.ElementType;
  items: NavItemType[];
};

const NavItem = ({ href, icon: Icon, label, currentPath, onClick }: { href: string; icon: React.ElementType; label: string; currentPath: string; onClick?: () => void; }) => {
  const isActive = currentPath === href || (href !== "/dashboard" && currentPath.startsWith(href));
  return (
    <Link href={href} passHref>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={`w-full justify-start text-sm pl-8 ${isActive ? 'font-semibold text-primary' : 'text-foreground hover:bg-muted/50 hover:text-primary'}`}
        aria-current={isActive ? "page" : undefined}
        onClick={onClick}
      >
        <Icon className="mr-3 h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
};

const NavGroup = ({ group, currentPath, onClick }: { group: NavGroupType; currentPath: string; onClick?: () => void }) => {
  // Check if any child is active to keep open
  const isChildActive = group.items.some(item => currentPath === item.href || currentPath.startsWith(item.href));
  const [isOpen, setIsOpen] = useState(isChildActive);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-1">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between font-semibold hover:bg-muted/50">
          <div className="flex items-center">
            <group.icon className="mr-3 h-5 w-5" />
            {group.label}
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1">
        {group.items.map(item => (
          <NavItem key={item.href} {...item} currentPath={currentPath} onClick={onClick} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

interface DashboardNavProps {
  onNavItemClick?: () => void;
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

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Define Navigation Groups
  const catalogGroup: NavGroupType = {
    label: 'Catálogo',
    icon: ShoppingBag,
    items: [
      { href: '/dashboard/products', icon: Package, label: 'Produtos' },
      { href: '/dashboard/categories', icon: Tags, label: 'Categorias' },
      { href: '/dashboard/brands', icon: Tags, label: 'Marcas' },
      { href: '/dashboard/stock', icon: Layers, label: 'Estoque' },
      { href: '/dashboard/quick-edit', icon: Edit, label: 'Edição Rápida' },
    ]
  };

  const salesGroup: NavGroupType = {
    label: 'Vendas',
    icon: BarChart3,
    items: [
      { href: '/dashboard/orders', icon: Package, label: 'Pedidos' },
      { href: '/dashboard/customers', icon: Users, label: 'Clientes' },
      { href: '/dashboard/sales', icon: TrendingUp, label: 'Relatórios' },
      { href: '/dashboard/coupons', icon: Ticket, label: 'Cupons' },
    ]
  };

  const shippingGroup: NavGroupType = {
    label: 'Envio',
    icon: Truck,
    items: [
      { href: '/dashboard/shipping/pack-station', icon: Package, label: 'Estação de Embalagem' },
      { href: '/dashboard/shipping', icon: Truck, label: 'Config. Frete' },
    ]
  };

  const storeGroup: NavGroupType = {
    label: 'Loja',
    icon: Store,
    items: [
      { href: '/dashboard', icon: Home, label: 'Visão Geral' }, // Kept Dashboard here or could be top level
      { href: '/dashboard/bi-analytics', icon: BarChart3, label: 'Analytics (BI)' },
      { href: '/dashboard/promotions', icon: Palette, label: 'Banners' },
      { href: '/dashboard/appearance', icon: LayoutGrid, label: 'Aparência' },
      { href: '/dashboard/automations', icon: Ticket, label: 'Automação Zap' },
      { href: '/dashboard/settings', icon: Settings, label: 'Configurações' },
    ]
  };

  // Top level item example (if Dashboard should be outside groups)
  const dashboardItem: NavItemType = { href: '/dashboard', icon: Home, label: 'Visão Geral' };


  return (
    <aside className="w-full md:w-64 h-full bg-card border-r-0 md:border-r md:border-border/60 p-4 flex flex-col overflow-y-auto">
      {/* Mobile Logo */}
      <div className="md:hidden p-4 mb-2 border-b border-border/60 flex justify-center">
        <Link href="/dashboard" onClick={onNavItemClick}>
          <Image
            src="/darkstore-logo.png"
            alt="DarkStore Logo"
            width={150}
            height={37}
            className="object-contain"
          />
        </Link>
        <CartSheet />
      </div>

      {/* User Profile */}
      <div className="p-4 mb-4 border-b border-border/60">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.email === "merchant@darkstore.com" ? "https://placehold.co/100x100.png" : undefined} alt={user?.name || "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {getInitials(user?.name || user?.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground truncate max-w-[140px]" title={user?.name || "Usuário"}>{user?.name || "Usuário"}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[140px]" title={user?.email}>{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-grow space-y-2">
        {/* Top Level Dashboard Link */}
        <Link href={dashboardItem.href} passHref>
          <Button
            variant={pathname === dashboardItem.href ? "secondary" : "ghost"}
            className={`w-full justify-start text-sm ${pathname === dashboardItem.href ? 'font-semibold text-primary' : 'text-foreground hover:bg-muted/50 hover:text-primary'}`}
            onClick={onNavItemClick}
          >
            <dashboardItem.icon className="mr-3 h-5 w-5" />
            {dashboardItem.label}
          </Button>
        </Link>

        <NavGroup group={catalogGroup} currentPath={pathname} onClick={onNavItemClick} />
        <NavGroup group={salesGroup} currentPath={pathname} onClick={onNavItemClick} />
        <NavGroup group={shippingGroup} currentPath={pathname} onClick={onNavItemClick} />

        <Separator className="my-2" />

        {/* Store Group as individual items or group? User asked for groupings. Let's group Loja stuff. */}
        <NavGroup group={{ ...storeGroup, items: storeGroup.items.filter(i => i.href !== '/dashboard') }} currentPath={pathname} onClick={onNavItemClick} />

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
