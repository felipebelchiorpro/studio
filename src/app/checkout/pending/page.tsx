"use client";

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useEffect } from 'react';

import { Suspense } from 'react';

function PendingContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const { clearCart } = useCart();

    useEffect(() => {
        if (orderId) {
            clearCart();
        }
    }, [orderId, clearCart]);

    return (
        <div className="max-w-md w-full bg-neutral-900/60 backdrop-blur-xl p-8 rounded-2xl border border-neutral-800 shadow-2xl text-center relative z-10">
            <div className="flex justify-center mb-6">
                <div className="bg-yellow-500/10 p-4 rounded-full ring-2 ring-yellow-500/20">
                    <Clock className="h-16 w-16 text-yellow-500" />
                </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">Pagamento Pendente</h1>
            <p className="text-gray-400 mb-6">
                Seu pagamento está sendo processado.
                {orderId && <span className="block mt-2 text-white font-mono bg-neutral-800 p-1 rounded">Pedido #{orderId}</span>}
            </p>

            <div className="bg-neutral-950/50 p-6 rounded-xl border border-neutral-800 space-y-4 mb-8">
                <p className="text-sm text-gray-400">
                    Assim que for confirmado, avisaremos você. Se foi via Boleto ou Pix, o processamento pode levar alguns instantes.
                </p>

                <Link href="/" className="block w-full">
                    <Button variant="outline" className="w-full border-neutral-700 hover:bg-neutral-800 text-white font-bold h-12">
                        Voltar para a Loja
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutPendingPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-900/5 rounded-full blur-[128px] pointer-events-none" />

            <Suspense fallback={<div className="text-white">Carregando...</div>}>
                <PendingContent />
            </Suspense>
        </div>
    );
}
