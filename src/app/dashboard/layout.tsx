
"use client";

import DashboardNav from '@/components/DashboardNav';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode, useState } from 'react';
import { Toaster } from '@/components/ui/toaster'; 
import { Button } from '@/components/ui/button';
import { Menu as MenuIcon, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import Image from 'next/image'; // For logo in mobile dash nav

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="ml-3 text-base sm:text-lg text-foreground">Carregando dashboard...</p>
        </div>
    );
  }

  if (!isAuthenticated) {
     return (
        <div className="flex items-center justify-center h-screen bg-background">
            <p className="text-base sm:text-lg text-foreground">Redirecionando para login...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-64">
        <DashboardNav />
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Mobile Header for Dashboard */}
        <header className="md:hidden bg-card border-b border-border/60 p-3 sm:p-4 flex items-center justify-between sticky top-0 z-30">
           <Link href="/dashboard" className="flex items-center">
             <Image
                src="/darkstore-logo.png" 
                alt="DarkStore Suplementos Logo"
                width={120} 
                height={30}
                className="object-contain"
              />
           </Link>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 bg-card">
              {/* Pass closeSheet function to DashboardNav if it needs to close the sheet on item click */}
              <DashboardNav onNavItemClick={() => setIsSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>
        
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
      {/* <Toaster /> Consider if Toaster is needed here or if RootLayout is sufficient */}
    </div>
  );
}

// Helper Link component for mobile header logo, if needed for specific styling
import Link from 'next/link';

