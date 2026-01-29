"use client";

import { useCart } from '@/context/CartContext';
import CartItemDisplay from '@/components/CartItemDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';

export default function CartPage() {
  const { cartItems, getCartTotal, clearCart, getCartItemCount } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const cartTotal = getCartTotal();
  const itemCount = getCartItemCount();
  const shippingCost = 0; // Pickup only
  const finalTotal = cartTotal;

  const handleCheckout = async () => {
    if (!phone) {
      toast({ title: "Telefone obrigatório", description: "Por favor, informe seu WhatsApp para contato.", variant: "destructive" });
      return;
    }

    setLoading(true);
    toast({
      title: "Processando pedido...",
      description: "Aguarde enquanto finalizamos sua compra...",
    });

    try {
      // Call Server Action to save order and trigger webhook
      const { processCheckout } = await import('@/actions/checkout');
      // Added phone parameter
      const result = await processCheckout(cartItems, finalTotal, phone);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Pedido criado. Redirecionando...",
        });
        // Don't clear cart here, do it on success page to generate whatsapp message
        // clearCart(); 
        if (result.url) {
          router.push(result.url);
        } else {
          toast({
            title: "Erro",
            description: "URL de pagamento não gerada.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Erro",
          description: "Falha ao processar pedido via Server Action.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Carrinho Limpo!",
      description: "Todos os itens foram removidos do seu carrinho.",
      variant: "default"
    });
  };

  return (
    <div className="container mx-auto py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-foreground">Seu Carrinho</h1>
        {itemCount > 0 ? (
          <p className="text-base sm:text-lg text-muted-foreground mt-1 sm:mt-2">
            Você tem {itemCount} item(ns) no seu carrinho.
          </p>
        ) : null}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-10 sm:py-12 bg-card rounded-lg shadow-md">
          <ShoppingBag className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-1.5 sm:mb-2">Seu carrinho está vazio.</h2>
          <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">Adicione produtos para vê-los aqui.</p>
          <Link href="/products" passHref>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base">
              Explorar Produtos
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 bg-card p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-border/40">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0">Itens do Carrinho</h2>
              <Button variant="outline" onClick={handleClearCart} className="text-xs sm:text-sm text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground w-full sm:w-auto">
                <Trash2 className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Limpar Carrinho
              </Button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {cartItems.map(item => (
                <CartItemDisplay key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20 sm:top-24 shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl sm:text-2xl">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 sm:space-y-3 text-sm sm:text-base">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({itemCount} itens):</span>
                  <span className="text-foreground font-medium">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Frete:</span>
                  <span className="text-foreground font-medium">
                    Retirada na Loja (Grátis)
                  </span>
                </div>
                <hr className="my-1.5 sm:my-2 border-border/40" />
                <div className="flex justify-between text-lg sm:text-xl font-bold">
                  <span>Total:</span>
                  <span>R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2.5 sm:gap-3">
                <div className="w-full space-y-2">
                  <label className="text-sm font-medium">Seu WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <Button size="lg" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base sm:text-lg py-2.5 sm:py-3" onClick={handleCheckout}>
                  {loading ? 'Processando...' : (
                    <>
                      <Image src="https://placehold.co/100x25.png" alt="Mercado Pago" width={100} height={25} className="mr-2" data-ai-hint="mercadopago logo" /> Finalizar com Mercado Pago
                    </>
                  )}
                </Button>
                <Link href="/products" className="w-full" passHref>
                  <Button variant="outline" size="lg" className="w-full text-sm sm:text-base">
                    Continuar Comprando
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
