"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Tag, X, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartItemDisplay from "@/components/CartItemDisplay";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import CustomerLoginForm from "@/components/CustomerLoginForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { validateCouponService } from "@/services/couponService";

export function CartSheet() {
    const { cartItems, getCartTotal, clearCart, getCartItemCount, coupon, applyCoupon, removeCoupon, getSubtotal, getDiscountAmount } = useCart();
    // Safely destructure with fallback if context is initially null
    const { customer } = useCustomerAuth() || {};
    const { toast } = useToast();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    const itemCount = getCartItemCount();
    const total = getCartTotal();
    const subtotal = getSubtotal();
    const discountAmount = getDiscountAmount();

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setIsApplying(true);
        try {
            const res = await validateCouponService(couponCode);
            if (res.valid && res.coupon) {
                applyCoupon(res.coupon);
                setCouponCode('');
                toast({ title: "Cupom aplicado!", description: res.message, className: "bg-green-600 text-white" });
            } else {
                toast({ title: "Inválido", description: res.message || "Cupom inválido", variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Erro ao validar cupom.", variant: "destructive" });
        } finally {
            setIsApplying(false);
        }
    };

    const handleCheckout = () => {
        if (!customer) {
            setShowLogin(true);
            toast({
                title: "Login Necessário",
                description: "Por favor, faça login para finalizar sua compra.",
            });
            return;
        }

        setOpen(false);
        router.push('/checkout/delivery');
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
                        {/* Coupon Section */}
                        <div className="space-y-2">
                            {coupon ? (
                                <div className="bg-green-900/20 border border-green-900/50 rounded-md p-3 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-2 text-green-400">
                                        <Tag className="h-4 w-4" />
                                        <span className="font-medium text-sm">Cupom: {coupon.code}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={removeCoupon} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Cupom de desconto"
                                            className="pl-9 bg-black/50 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-red-500"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="border-white/10 hover:bg-white/10 hover:text-white"
                                        onClick={handleApplyCoupon}
                                        disabled={isApplying || !couponCode}
                                    >
                                        {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            {coupon && (
                                <div className="flex justify-between text-green-400 font-medium">
                                    <span>Desconto</span>
                                    <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-lg font-bold border-t border-white/10 pt-2 mt-2">
                                <span>Total</span>
                                <span className="text-red-400">R$ {total.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 text-base bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all hover:shadow-[0_0_25px_rgba(220,38,38,0.7)]"
                            disabled={loading}
                            onClick={handleCheckout}
                        >
                            {loading ? "Processando..." : "Finalizar Compra"}
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
