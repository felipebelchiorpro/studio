'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { processPayment } from '@/actions/payment';
import { createOrderAction } from '@/actions/order';

declare global {
    interface Window {
        MercadoPago: any;
    }
}

export default function CheckoutPage() {
    const { cartItems, getCartTotal, updateContactInfo, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [mpLoaded, setMpLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

    // Local state for inputs to manage pre-fill and manual entry
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Pre-fill from Auth
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.email) setEmail(user.email);
            if (user.phone) setPhone(user.phone);
            // Sync immediately if we have data
            updateContactInfo(user.email, user.phone);
        }
    }, [isAuthenticated, user, updateContactInfo]);

    // Handle input changes
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
    };

    const handleContactBlur = () => {
        updateContactInfo(email, phone);
    };

    useEffect(() => {
        if (mpLoaded && window.MercadoPago) {
            const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);

            const cardForm = mp.cardForm({
                amount: getCartTotal().toString(),
                iframe: true,
                form: {
                    id: "form-checkout",
                    cardNumber: {
                        id: "form-checkout__cardNumber",
                        placeholder: "Número do cartão",
                    },
                    expirationDate: {
                        id: "form-checkout__expirationDate",
                        placeholder: "MM/YY",
                    },
                    securityCode: {
                        id: "form-checkout__securityCode",
                        placeholder: "CVC",
                    },
                    cardholderName: {
                        id: "form-checkout__cardholderName",
                        placeholder: "Titular do cartão",
                    },
                    issuer: {
                        id: "form-checkout__issuer",
                        placeholder: "Banco emissor",
                    },
                    installments: {
                        id: "form-checkout__installments",
                        placeholder: "Parcelas",
                    },
                    identificationType: {
                        id: "form-checkout__identificationType",
                        placeholder: "Tipo de documento",
                    },
                    identificationNumber: {
                        id: "form-checkout__identificationNumber",
                        placeholder: "Número do documento",
                    },
                    cardholderEmail: {
                        id: "form-checkout__cardholderEmail",
                        placeholder: "E-mail",
                    },
                },
                callbacks: {
                    onFormMounted: (error: any) => {
                        if (error) return console.warn("Form Mounted Error:", error);
                        console.log("Form Mounted");
                    },
                    onSubmit: async (event: any) => {
                        event.preventDefault();
                        setLoading(true);

                        const {
                            paymentMethodId: payment_method_id,
                            issuerId: issuer_id,
                            cardholderEmail: email, // MP gets this from the form input with ID form-checkout__cardholderEmail
                            amount,
                            token,
                            installments,
                            identificationNumber,
                            identificationType,
                        } = cardForm.getCardFormData();

                        const payload = {
                            token,
                            issuer_id,
                            payment_method_id,
                            transaction_amount: Number(amount),
                            installments: Number(installments),
                            description: `Pedido Darkstore - ${cartItems.length} itens`,
                            payer: {
                                email,
                                identification: {
                                    type: identificationType,
                                    number: identificationNumber,
                                },
                            },
                        };

                        const result = await processPayment(payload);


                        if (result.success) {
                            // Payment Approved! Now Create Order
                            const orderRes = await createOrderAction({
                                userId: user?.id,
                                items: cartItems,
                                totalAmount: Number(amount),
                                paymentId: result.id ? result.id.toString() : 'unknown',
                                status: 'approved',
                                userEmail: email,
                                userPhone: phone
                            });

                            if (orderRes.success) {
                                clearCart();
                                router.push(`/checkout/success?order_id=${orderRes.orderId}`);
                            } else {
                                setLoading(false);
                                alert(`Pagamento Aprovado, mas erro ao salvar pedido: ${orderRes.message}`);
                            }
                        } else {
                            setLoading(false);
                            alert(`Erro: ${result.message}`);
                        }
                    },
                    onFetching: (resource: any) => {
                        console.log("Fetching resource: ", resource);
                        setLoading(true);
                        return () => setLoading(false);
                    }
                },
            });
        }
    }, [mpLoaded, getCartTotal, cartItems, user, phone, email, updateContactInfo, clearCart, router]);

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8 pt-24">
            <Script
                src="https://sdk.mercadopago.com/js/v2"
                onLoad={() => setMpLoaded(true)}
            />

            <div className="max-w-md mx-auto bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-red-500 neon-text">Checkout Transparente</h2>

                <form id="form-checkout" className="space-y-4">
                    {/* Card Number */}
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Número do Cartão</label>
                        <div id="form-checkout__cardNumber" className="h-10 bg-neutral-800 rounded px-2" />
                    </div>

                    {/* Date & CVC */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Validade</label>
                            <div id="form-checkout__expirationDate" className="h-10 bg-neutral-800 rounded px-2" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">CVC</label>
                            <div id="form-checkout__securityCode" className="h-10 bg-neutral-800 rounded px-2" />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Nome do Titular</label>
                        <input type="text" id="form-checkout__cardholderName" className="w-full h-10 bg-neutral-800 rounded px-3 border border-neutral-700 focus:border-red-500 outline-none text-white" />
                    </div>

                    {/* Issuer */}
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Banco Emissor</label>
                        <select id="form-checkout__issuer" className="w-full h-10 bg-neutral-800 rounded px-3 border border-neutral-700 text-white" />
                    </div>

                    {/* Installments */}
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Parcelas</label>
                        <select id="form-checkout__installments" className="w-full h-10 bg-neutral-800 rounded px-3 border border-neutral-700 text-white" />
                    </div>

                    {/* Doc Type & Number */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1 col-span-1">
                            <label className="text-xs text-gray-400">Tipo</label>
                            <select id="form-checkout__identificationType" className="w-full h-10 bg-neutral-800 rounded px-3 border border-neutral-700 text-white" />
                        </div>
                        <div className="space-y-1 col-span-2">
                            <label className="text-xs text-gray-400">Número do Documento</label>
                            <input type="text" id="form-checkout__identificationNumber" className="w-full h-10 bg-neutral-800 rounded px-3 border border-neutral-700 text-white" />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Email</label>
                        <input
                            type="email"
                            id="form-checkout__cardholderEmail"
                            className="w-full h-10 bg-neutral-800 rounded px-3 border border-neutral-700 text-white"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleContactBlur}
                            placeholder="seu@email.com"
                        />
                    </div>

                    {/* Phone (New Field) */}
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Telefone / WhatsApp</label>
                        <input
                            type="tel"
                            className="w-full h-10 bg-neutral-800 rounded px-3 border border-neutral-700 text-white focus:border-red-500 outline-none"
                            value={phone}
                            onChange={handlePhoneChange}
                            onBlur={handleContactBlur}
                            placeholder="(11) 99999-9999"
                        />
                    </div>

                    <button
                        type="submit"
                        id="form-checkout__submit"
                        disabled={loading}
                        className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all flex justify-center items-center"
                    >
                        {loading ? 'Processando...' : 'Pagar Agora'}
                    </button>
                </form>
            </div>
        </div>
    );
}
