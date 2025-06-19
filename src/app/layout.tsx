
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext'; // Added
import { CartProvider } from '@/context/CartContext';
import { BrandProvider } from '@/context/BrandContext';
import { ProductProvider } from '@/context/ProductContext';
import ConditionalLayout from '@/components/layout/ConditionalLayout';

export const metadata: Metadata = {
  title: 'DarkStore Suplementos',
  description: 'Sua loja de suplementos para performance e saúde.',
  keywords: 'suplementos, whey protein, creatina, vitaminas, e-commerce, fitness, darkstore',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col">
        <AuthProvider>
          <CustomerAuthProvider> {/* Added CustomerAuthProvider */}
            <BrandProvider>
              <ProductProvider>
                <CartProvider>
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                  <Toaster />
                </CartProvider>
              </ProductProvider>
            </BrandProvider>
          </CustomerAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
