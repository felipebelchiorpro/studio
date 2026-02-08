"use client";

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutFailurePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-900/5 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-md w-full bg-neutral-900/60 backdrop-blur-xl p-8 rounded-2xl border border-neutral-800 shadow-2xl text-center relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-red-500/10 p-4 rounded-full ring-2 ring-red-500/20">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Pagamento Recusado</h1>
        <p className="text-gray-400 mb-6">
          Houve um problema ao processar seu pagamento.
          {orderId && <span className="block mt-2 text-white font-mono bg-neutral-800 p-1 rounded">Ref: #{orderId}</span>}
        </p>

        <div className="bg-neutral-950/50 p-6 rounded-xl border border-neutral-800 space-y-4 mb-8">
          <p className="text-sm text-gray-400">
            Não se preocupe, nenhuma cobrança foi feita. Você pode tentar novamente com outro cartão ou método de pagamento.
          </p>

          <Link href="/checkout" className="block w-full">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all">
              <RefreshCcw className="mr-2 h-5 w-5" />
              Tentar Novamente
            </Button>
          </Link>
        </div>

        <Link href="/" className="text-sm text-gray-500 hover:text-white hover:underline transition-colors">
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
