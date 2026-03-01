'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { processCheckout } from '@/actions/checkout';
import { MapPin, Truck, Store, Edit2, ShieldCheck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useStoreStatus } from '@/hooks/useStoreStatus';

export default function CheckoutPage() {
    const { cartItems, getCartTotal, updateContactInfo, shippingInfo } = useCart();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Contact State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const { storeSettings, storeStatus } = useStoreStatus();

    // Redirect if no shipping info (basic check)
    useEffect(() => {
        if (!shippingInfo.method) {
            router.replace('/checkout/delivery');
        }
        if (shippingInfo.method === 'shipping' && (!shippingInfo.address || !shippingInfo.address.city)) {
            router.replace('/checkout/delivery');
        }
    }, [shippingInfo, router]);

    // Pre-fill from Auth
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.name) setName(user.name);
            if (user.email) setEmail(user.email);
            if (user.phone) setPhone(user.phone);
            updateContactInfo(user.email, user.phone);
        }
    }, [isAuthenticated, user, updateContactInfo]);

    const handleContactBlur = () => {
        updateContactInfo(email, phone);
    };

    const handleCheckout = async () => {
        if (!name || !email || !phone) {
            toast({ title: "Dados incompletos", description: "Preencha nome, email e telefone para continuar.", variant: "destructive" });
            return;
        }

        setLoading(true);

        const result = await processCheckout(
            cartItems,
            getCartTotal(),
            {
                id: user?.id,
                name: name,
                email: email,
                phone: phone
            },
            shippingInfo
        );

        if (result.success && result.url) {
            // Redirect to Mercado Pago
            window.location.href = result.url;
        } else {
            toast({ title: "Erro", description: result.message || "Falha ao iniciar pagamento.", variant: "destructive" });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8 pt-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-900/5 rounded-full blur-[128px] pointer-events-none" />

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                {/* Left Column: Summary */}
                <div className="space-y-6">
                    <Card className="bg-neutral-900/60 backdrop-blur-xl border-neutral-800 text-white shadow-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-neutral-800">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <span className="bg-red-500/10 p-2 rounded-lg text-red-500">
                                    {shippingInfo.method === 'shipping' ? <Truck className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                                </span>
                                {shippingInfo.method === 'shipping' ? 'Entrega' : 'Retirada'}
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/checkout/delivery')} className="text-gray-400 hover:text-white hover:bg-neutral-800">
                                <Edit2 className="h-4 w-4 mr-2" /> Alterar
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {shippingInfo.method === 'shipping' && shippingInfo.address ? (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-red-500 mt-1 shrink-0" />
                                        <div>
                                            <p className="font-semibold text-white text-lg">{shippingInfo.address.street}, {shippingInfo.address.number}</p>
                                            <p className="text-gray-400">{shippingInfo.address.neighborhood} - {shippingInfo.address.city}</p>
                                            {shippingInfo.address.cep && <p className="text-sm text-gray-500">CEP: {shippingInfo.address.cep}</p>}
                                        </div>
                                    </div>
                                    {shippingInfo.address.reference && (
                                        <div className="bg-neutral-950/50 p-3 rounded-lg border border-neutral-800 text-sm text-gray-400">
                                            <span className="font-semibold text-gray-300">Ref:</span> {shippingInfo.address.reference}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Store className="h-5 w-5 text-red-500 mt-1 shrink-0" />
                                        <div>
                                            <p className="font-semibold text-white text-lg">Retirada na Loja</p>
                                            <p className="text-gray-400 max-w-[280px] sm:max-w-none">
                                                {storeSettings?.store_address || 'Endereço da loja não configurado no painel'}
                                            </p>
                                        </div>
                                    </div>
                                    {storeSettings?.store_hours && (
                                        <div className="bg-neutral-950/50 p-3 rounded-lg border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2.5 h-2.5 rounded-full ${storeStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                <span className={`font-semibold ${storeStatus.isOpen ? 'text-green-500' : 'text-red-500'}`}>
                                                    {storeStatus.text}
                                                </span>
                                            </div>
                                            {storeStatus.rawText && (
                                                <span className="text-sm text-gray-400">
                                                    Horário hoje: {storeStatus.rawText}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="bg-neutral-900/60 backdrop-blur-xl p-6 rounded-xl border border-neutral-800 shadow-xl space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-red-500" /> Resumo do Pedido
                        </h3>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-center py-3 border-b border-neutral-800 last:border-0 gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-md overflow-hidden border border-neutral-800 flex items-center justify-center">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            ) : (
                                                <Store className="w-6 h-6 text-neutral-400" />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-gray-200 text-sm font-medium truncate" title={item.name}>
                                                <span className="text-red-500 font-bold mr-1">{item.quantity}x</span>
                                                {item.name}
                                            </span>
                                            {(item.selectedFlavor || item.selectedSize) && (
                                                <span className="text-xs text-gray-500 truncate mt-0.5">
                                                    {item.selectedFlavor && `Sabor: ${item.selectedFlavor}`}
                                                    {item.selectedFlavor && item.selectedSize && ` | `}
                                                    {item.selectedSize && `Tam: ${item.selectedSize}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end flex-shrink-0">
                                        <span className="text-white font-medium text-sm">
                                            R$ {(Number(item.price) * item.quantity).toFixed(2)}
                                        </span>
                                        {item.quantity > 1 && (
                                            <span className="text-[10px] text-gray-500">
                                                R$ {Number(item.price).toFixed(2)} cada
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-neutral-800 pt-4 mt-4 space-y-3">
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Subtotal</span>
                                <span>R$ {getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>{shippingInfo.method === 'shipping' ? 'Frete' : 'Taxa de Retirada'}</span>
                                <span className={shippingInfo.fee === 0 ? 'text-green-500' : ''}>
                                    {shippingInfo.fee === 0 ? 'Grátis' : `R$ ${shippingInfo.fee.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold text-white mt-2 pt-4 border-t border-neutral-800">
                                <span>Total</span>
                                <span className="text-red-500">R$ {(getCartTotal() + shippingInfo.fee).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Checkout Action */}
                <div className="flex flex-col gap-6">
                    <Card className="bg-neutral-900/60 backdrop-blur-xl border-neutral-800 text-white shadow-2xl h-fit">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-white">Dados de Contato</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Nome Completo</label>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="João da Silva"
                                    className="bg-neutral-950 border-neutral-800 h-12 text-white focus-visible:ring-red-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Email para contato e comprovante</label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={handleContactBlur}
                                    placeholder="seu@email.com"
                                    className="bg-neutral-950 border-neutral-800 h-12 text-white focus-visible:ring-red-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Telefone / WhatsApp</label>
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    onBlur={handleContactBlur}
                                    placeholder="(11) 99999-9999"
                                    className="bg-neutral-950 border-neutral-800 h-12 text-white focus-visible:ring-red-500"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-neutral-900/60 backdrop-blur-xl border-neutral-800 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-900/5 via-transparent to-transparent pointer-events-none" />
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="h-6 w-6 text-green-500" /> Pagamento Seguro
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-gray-400">
                                Você será redirecionado para o ambiente seguro do <strong>Mercado Pago</strong> para finalizar sua compra. Aceitamos Cartão de Crédito, Pix e Boleto.
                            </p>

                            <div className="grid grid-cols-3 gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                <div className="bg-white p-2 rounded flex items-center justify-center h-10">
                                    <img src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.21.3/mercadopago/logo__small.png" alt="Mercado Pago" className="h-full object-contain" />
                                </div>
                                <div className="bg-white p-2 rounded flex items-center justify-center h-10">
                                    <img src="https://logospng.org/download/pix/logo-pix-icone-512.png" alt="Pix" className="h-full object-contain" />
                                </div>
                                <div className="bg-white p-2 rounded flex items-center justify-center h-10">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-full object-contain" />
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full h-16 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)] hover:shadow-[0_0_30px_rgba(22,163,74,0.6)] transition-all transform hover:-translate-y-1 rounded-xl"
                            >
                                {loading ? 'Carregando...' : 'Pagar com Mercado Pago'}
                            </Button>

                            <p className="text-xs text-center text-gray-500">
                                Ambiente 100% criptografado e seguro.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
