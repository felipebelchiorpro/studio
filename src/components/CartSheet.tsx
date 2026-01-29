"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartItemDisplay from "@/components/CartItemDisplay";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import CustomerLoginForm from "@/components/CustomerLoginForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function CartSheet() {
    const { cartItems, getCartTotal, clearCart, getCartItemCount } = useCart();
    // Safely destructure with fallback if context is initially null (though provider should ensure it exists)
    const { customer } = useCustomerAuth() || {};
    const { toast } = useToast();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    const itemCount = getCartItemCount();
    const total = getCartTotal();

    const handleCheckout = async () => {
        if (!process.env.NEXT_PUBLIC_BASE_URL && typeof window !== 'undefined') {
            // just a safety check
        }

        if (!customer) {
            setShowLogin(true);
            toast({
                title: "Login Necessário",
                description: "Por favor, faça login para finalizar sua compra.",
            });
            return;
        }

        // Phone check is now handled by customer data, or implied to be present/handled at checkout
        const customerPhone = customer.phone || '00000000000'; // Fallback or handle missing phone if critical

        setLoading(true);
        try {
            const { processCheckout } = await import('@/actions/checkout');
            const result = await processCheckout(cartItems, total, customerPhone);

            if (result.success && result.url) {
                window.location.href = result.url;
            } else {
                toast({
                    title: "Erro",
                    description: result.message || "Erro ao iniciar pagamento.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Erro inesperado.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 h-14 w-14">
                    <ShoppingBag className="h-10 w-10" />
                    {itemCount > 0 && (
                        <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-green-600 text-[11px] font-bold text-white flex items-center justify-center border-2 border-background">
                            {itemCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-lg bg-black/40 backdrop-blur-xl border-l border-red-500/30 shadow-[-10px_0_30px_-5px_rgba(220,38,38,0.2)] text-white overflow-x-hidden">
                <SheetHeader className="border-b border-white/10 pb-4">
                    <SheetTitle className="flex items-center gap-2 text-white">
                        Meu Carrinho
                        {itemCount > 0 && (
                            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]">{itemCount}</span>
                        )}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                            <p className="text-muted-foreground font-medium">Seu carrinho está vazio</p>
                            <Button variant="outline" onClick={() => setOpen(false)} className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">Começar a comprar</Button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <CartItemDisplay key={item.id} item={item} compact />
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="border-t border-white/10 pt-4 space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span className="text-red-400">R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>

                        <div className="space-y-2">
                            {/* Phone input removed as per user request - data comes from login */}
                        </div>

                        <Button
                            className="w-full h-12 text-base bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all hover:shadow-[0_0_25px_rgba(220,38,38,0.7)]"
                            disabled={loading}
                            onClick={handleCheckout}
                        >
                            {loading ? "Processando..." : (
                                <>
                                    Finalizar Compra
                                </>
                            )}
                        </Button>

                        <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-red-400 hover:bg-transparent" onClick={clearCart}>
                            Limpar Carrinho
                        </Button>
                    </div>
                )}
            </SheetContent>

            <Dialog open={showLogin} onOpenChange={setShowLogin}>
                <DialogContent className="sm:max-w-md bg-white text-black p-0 border-none overflow-hidden">
                    {/* Pass onSuccess to close the modal after login */}
                    <CustomerLoginForm onSuccess={() => {
                        setShowLogin(false);
                        toast({ title: "Login realizado!", description: "Agora você pode finalizar sua compra.", className: "bg-green-600 text-white" });
                    }} />
                </DialogContent>
            </Dialog>

        </Sheet >
    );
}
