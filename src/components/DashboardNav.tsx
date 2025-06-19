
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, BarChart3, Layers, LogOut, Settings, UserCircle, Edit, Tags, LayoutGrid, Truck } from 'lucide-react'; // Adicionado Truck
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const NavItem = ({ href, icon: Icon, label, currentPath }: { href: string; icon: React.ElementType; label: string; currentPath: string; }) => {
  const isActive = currentPath === href || (href !== "/dashboard" && currentPath.startsWith(href));
  return (
    <Link href={href} passHref>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={`w-full justify-start text-sm ${isActive ? 'font-semibold text-primary' : 'text-foreground hover:bg-muted/50 hover:text-primary'}`}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className="mr-3 h-5 w-5" />
        {label}
      </Button>
    </Link>
  );
};

export default function DashboardNav() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Visão Geral' },
    { href: '/dashboard/products', icon: Package, label: 'Gerenciar Produtos' },
    { href: '/dashboard/sales', icon: BarChart3, label: 'Relatório de Vendas' },
    { href: '/dashboard/stock', icon: Layers, label: 'Controle de Estoque' },
    { href: '/dashboard/quick-edit', icon: Edit, label: 'Edição Rápida' },
    { href: '/dashboard/categories', icon: LayoutGrid, label: 'Gerenciar Categorias' },
    { href: '/dashboard/brands', icon: Tags, label: 'Gerenciar Marcas' },
    { href: '/dashboard/shipping/pack-station', icon: Truck, label: 'Estação de Embalagem' }, // Nova rota
    // { href: '/dashboard/settings', icon: Settings, label: 'Configurações' }, // Example for future expansion
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
    <aside className="w-64 min-h-screen bg-card border-r border-border/60 p-4 flex flex-col fixed left-0 top-0 pt-16 md:pt-0 z-40 md:relative md:z-auto">
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
          <NavItem key={item.href} {...item} currentPath={pathname} />
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
