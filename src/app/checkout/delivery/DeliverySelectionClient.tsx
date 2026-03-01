'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getShippingRates, ShippingRate } from '@/actions/shipping';
import { updateUserAddressAction } from '@/actions/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Store, MapPin, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStoreStatus } from '@/hooks/useStoreStatus';

export default function DeliverySelectionClient() {
    const router = useRouter();
    const { updateShippingInfo, shippingInfo } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const { storeSettings, storeStatus } = useStoreStatus();

    const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
    const [method, setMethod] = useState<'shipping' | 'pickup'>(shippingInfo.method || 'shipping');
    const [selectedCityId, setSelectedCityId] = useState<string>(shippingInfo.address?.cityId || '');
    const [address, setAddress] = useState({
        street: shippingInfo.address?.street || '',
        number: shippingInfo.address?.number || '',
        neighborhood: shippingInfo.address?.neighborhood || '',
        reference: shippingInfo.address?.reference || '',
        cep: shippingInfo.address?.cep || ''
    });
    const [loading, setLoading] = useState(false);

    // Fetch Rates
    useEffect(() => {
        getShippingRates().then(setShippingRates);
    }, []);

    // Load User Address if available and not already set
    useEffect(() => {
        if (isAuthenticated && user && user.user_metadata?.address && !shippingInfo.address?.street) {
            const savedAddress = user.user_metadata.address;
            setAddress(savedAddress);
            if (savedAddress.cityId) {
                setSelectedCityId(savedAddress.cityId);
            }
        }
    }, [isAuthenticated, user, shippingInfo.address?.street]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (method === 'shipping') {
            if (!selectedCityId || !address.street || !address.number || !address.neighborhood) {
                toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
                setLoading(false);
                return;
            }

            const city = shippingRates.find(r => r.id === selectedCityId);
            if (!city) {
                toast({ title: "Erro", description: "Cidade inválida.", variant: "destructive" });
                setLoading(false);
                return;
            }

            const newShippingInfo = {
                method: 'shipping' as const,
                address: {
                    ...address,
                    city: city.city_name,
                    cityId: city.id
                },
                fee: city.base_fee
            };

            updateShippingInfo(newShippingInfo);

            // Save address if logged in
            if (isAuthenticated && user) {
                await updateUserAddressAction(user.id, newShippingInfo.address);
            }
        } else {
            updateShippingInfo({
                method: 'pickup',
                fee: 0
            });
        }

        router.push('/checkout');
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-2 sm:p-8 pt-20 sm:pt-24 flex justify-center items-start relative overflow-hidden">
            {/* Neon Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[128px] pointer-events-none" />

            <Card className="w-full max-w-3xl border-neutral-800 bg-neutral-900/60 backdrop-blur-xl text-white relative z-10 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />

                <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-xl sm:text-3xl font-bold flex items-center gap-3 flex-wrap">
                        <span className="bg-red-500/10 p-2 sm:p-2.5 rounded-xl text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)] border border-red-500/20">
                            <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
                        </span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Método de Entrega
                        </span>
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm sm:text-lg">
                        Como você prefere receber seu pedido?
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 sm:space-y-8">
                    <RadioGroup defaultValue={method} onValueChange={(val) => setMethod(val as 'shipping' | 'pickup')} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                        <label
                            htmlFor="shipping"
                            className={`group relative flex flex-col p-4 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${method === 'shipping' ? 'border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-800/80'}`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 transition-opacity duration-300 ${method === 'shipping' ? 'opacity-100' : 'group-hover:opacity-100'}`} />

                            <RadioGroupItem value="shipping" id="shipping" className="absolute right-4 top-4 border-red-500 text-red-500" />
                            <div className={`p-2 sm:p-3 rounded-xl w-fit mb-3 sm:mb-4 transition-colors ${method === 'shipping' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-neutral-800 text-gray-400 group-hover:text-white'}`}>
                                <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <span className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${method === 'shipping' ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>Entrega em Casa</span>
                            <span className="text-xs sm:text-sm text-gray-400 leading-relaxed font-light">Receba no conforto da sua casa com agilidade e segurança total.</span>
                        </label>

                        <label
                            htmlFor="pickup"
                            className={`group relative flex flex-col p-4 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${method === 'pickup' ? 'border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-800/80'}`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 transition-opacity duration-300 ${method === 'pickup' ? 'opacity-100' : 'group-hover:opacity-100'}`} />

                            <RadioGroupItem value="pickup" id="pickup" className="absolute right-4 top-4 border-red-500 text-red-500" />
                            <div className={`p-2 sm:p-3 rounded-xl w-fit mb-3 sm:mb-4 transition-colors ${method === 'pickup' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-neutral-800 text-gray-400 group-hover:text-white'}`}>
                                <Store className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <span className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${method === 'pickup' ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>Retirar na Loja</span>
                            <span className="text-xs sm:text-sm text-gray-400 leading-relaxed font-light">Busque seu pedido em nossa loja física sem custo de frete.</span>
                        </label>
                    </RadioGroup>

                    <div className="bg-neutral-950/30 p-1 rounded-2xl border border-neutral-800/50">
                        <div className="bg-neutral-900/80 p-6 rounded-xl backdrop-blur-sm min-h-[300px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {method === 'shipping' ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                                        <h3 className="font-semibold text-white flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-red-500" /> Endereço de Entrega
                                        </h3>
                                        {selectedCityId && (
                                            <span className="text-xs font-mono bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                                {shippingRates.find(r => r.id === selectedCityId)?.estimated_delivery_time || '...'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="city" className="text-gray-400 text-xs uppercase tracking-wider font-semibold ml-1">Cidade Explorer</Label>
                                            <Select onValueChange={setSelectedCityId} value={selectedCityId}>
                                                <SelectTrigger id="city" className="bg-neutral-950 border-neutral-800 text-white h-12 focus:ring-1 focus:ring-red-500/50 hover:border-neutral-700 transition-all rounded-lg">
                                                    <SelectValue placeholder="Selecione sua cidade" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                                    {shippingRates.map(rate => (
                                                        <SelectItem key={rate.id} value={rate.id} className="focus:bg-red-600 focus:text-white cursor-pointer py-3">
                                                            {rate.city_name} <span className="text-xs opacity-70 ml-2">(+ R$ {rate.base_fee.toFixed(2)})</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            <div className="md:col-span-2 space-y-2">
                                                <Label htmlFor="street" className="text-gray-400 text-xs uppercase tracking-wider font-semibold ml-1">Rua</Label>
                                                <Input
                                                    id="street"
                                                    name="street"
                                                    value={address.street}
                                                    onChange={handleAddressChange}
                                                    placeholder="Ex: Rua das Flores"
                                                    className="bg-neutral-950 border-neutral-800 text-white h-12 focus-visible:ring-1 focus-visible:ring-red-500/50 hover:border-neutral-700 transition-all rounded-lg"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="number" className="text-gray-400 text-xs uppercase tracking-wider font-semibold ml-1">Número</Label>
                                                <Input
                                                    id="number"
                                                    name="number"
                                                    value={address.number}
                                                    onChange={handleAddressChange}
                                                    placeholder="123"
                                                    className="bg-neutral-950 border-neutral-800 text-white h-12 focus-visible:ring-1 focus-visible:ring-red-500/50 hover:border-neutral-700 transition-all rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="neighborhood" className="text-gray-400 text-xs uppercase tracking-wider font-semibold ml-1">Bairro</Label>
                                                <Input
                                                    id="neighborhood"
                                                    name="neighborhood"
                                                    value={address.neighborhood}
                                                    onChange={handleAddressChange}
                                                    className="bg-neutral-950 border-neutral-800 text-white h-12 focus-visible:ring-1 focus-visible:ring-red-500/50 hover:border-neutral-700 transition-all rounded-lg"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cep" className="text-gray-400 text-xs uppercase tracking-wider font-semibold ml-1">CEP (Opcional)</Label>
                                                <Input
                                                    id="cep"
                                                    name="cep"
                                                    value={address.cep}
                                                    onChange={handleAddressChange}
                                                    placeholder="00000-000"
                                                    className="bg-neutral-950 border-neutral-800 text-white h-12 focus-visible:ring-1 focus-visible:ring-red-500/50 hover:border-neutral-700 transition-all rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reference" className="text-gray-400 text-xs uppercase tracking-wider font-semibold ml-1">Ponto de Referência</Label>
                                            <Input
                                                id="reference"
                                                name="reference"
                                                value={address.reference}
                                                onChange={handleAddressChange}
                                                placeholder="Próximo ao mercado..."
                                                className="bg-neutral-950 border-neutral-800 text-white h-12 focus-visible:ring-1 focus-visible:ring-red-500/50 hover:border-neutral-700 transition-all rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                                    <div className="bg-neutral-950 p-6 rounded-full border border-neutral-800 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                                        <Store className="h-12 w-12 text-red-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-bold text-white tracking-tight">Vem pra DarkStore</h4>
                                        <p className="text-gray-400 max-w-sm mx-auto">Venha nos visitar e retire seu pedido enquanto toma um café conosco.</p>
                                    </div>

                                    <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 w-full max-w-sm text-left relative overflow-hidden group hover:border-red-500/30 transition-colors">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/10 rounded-bl-full blur-xl" />
                                        <div className="flex items-start gap-4 relative z-10">
                                            <MapPin className="h-6 w-6 text-red-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-white font-bold text-lg">Retirada na Loja</p>
                                                <p className="text-gray-400 mt-1">
                                                    {storeSettings?.store_address || 'Endereço da loja não configurado no painel'}
                                                </p>

                                                {storeSettings?.store_hours && (
                                                    <div className="mt-4 flex flex-col gap-1 text-sm text-gray-400 bg-neutral-900 w-fit px-4 py-2 rounded-xl border border-neutral-800">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2.5 h-2.5 rounded-full ${storeStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                            <span className={`font-semibold ${storeStatus.isOpen ? 'text-green-500' : 'text-red-500'}`}>
                                                                {storeStatus.text}
                                                            </span>
                                                        </div>
                                                        {storeStatus.rawText && (
                                                            <span className="text-xs">
                                                                Hoje: {storeStatus.rawText}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pb-8 pt-4 px-4 sm:px-8">
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full text-base sm:text-lg h-12 sm:h-14 bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all transform hover:-translate-y-1 active:scale-[0.98] rounded-xl flex items-center justify-center"
                    >
                        {loading ? 'Processando...' : (
                            <>
                                <span className="sm:hidden">Ir para Pagamento</span>
                                <span className="hidden sm:inline">Confirmar e Ir para Pagamento</span>
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
