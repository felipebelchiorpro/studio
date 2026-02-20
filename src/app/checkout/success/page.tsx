"use client";

import { useEffect, useState, Suspense } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { updateOrderStatusAction } from '@/actions/order';

function SuccessContent() {
  const { cartItems, clearCart, getCartTotal } = useCart();
  const searchParams = useSearchParams();
  const [whatsappLink, setWhatsappLink] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(true);
  const orderIdFromUrl = searchParams.get('order_id');

  useEffect(() => {
    async function handleSuccess() {
      // 1. Update Order Status if ID present
      if (orderIdFromUrl) {
        try {
          await updateOrderStatusAction(orderIdFromUrl, 'paid');
          console.log(`Order ${orderIdFromUrl} marked as paid.`);
        } catch (error) {
          console.error("Failed to update order status:", error);
        } finally {
          setIsUpdatingStatus(false);
        }
      } else {
        setIsUpdatingStatus(false);
      }

      // 2. Clear Cart and generate WhatsApp link logic
      if (cartItems.length > 0) {
        const total = getCartTotal();
        const displayOrderId = orderIdFromUrl ? `#${orderIdFromUrl.slice(-6)}` : `#ORD-${Date.now().toString().slice(-6)}`;

        let message = `*Olá! Fiz um pedido na loja online.*%0A%0A`;
        message += `*Pedido:* ${displayOrderId}%0A`;
        message += `*Status:* Pagamento Confirmado (Mercado Pago)%0A%0A`;
        message += `*Itens do Pedido:*%0A`;

        cartItems.forEach(item => {
          message += `- ${item.quantity}x ${item.name}`;
          if (item.selectedSize) message += ` (Tam: ${item.selectedSize})`;
          if (item.selectedFlavor) message += ` (Sabor: ${item.selectedFlavor})`;
          if (item.selectedColor) message += ` (Cor: ${item.selectedColor})`;
          message += `%0A`;
        });

        message += `%0A*Total:* R$ ${total.toFixed(2)}%0A%0A`;
        message += `Gostaria de combinar a retirada.`;

        const phoneNumber = '5511999999999'; // Replace with real one if available
        setWhatsappLink(`https://wa.me/${phoneNumber}?text=${message}`);

        setTimeout(() => {
          clearCart();
        }, 1000);
      }
    }

    handleSuccess();
  }, [orderIdFromUrl, cartItems, getCartTotal, clearCart]);

  return (
    <div className="container mx-auto py-20 px-4 text-center">
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex justify-center">
          {isUpdatingStatus ? (
            <Loader2 className="h-24 w-24 text-red-500 animate-spin" />
          ) : (
            <CheckCircle2 className="h-24 w-24 text-green-500" />
          )}
        </div>

        <h1 className="text-3xl font-bold">
          {isUpdatingStatus ? 'Confirmando Pagamento...' : 'Pedido Confirmado!'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {isUpdatingStatus
            ? 'Aguarde um momento enquanto atualizamos seu pedido.'
            : 'Seu pagamento foi processado com sucesso.'}
        </p>

        {!isUpdatingStatus && (
          <div className="bg-card p-6 rounded-lg shadow-sm border text-left space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">O que fazer agora?</h3>
            <p className="text-sm">
              Para agilizar a retirada do seu pedido, envie o comprovante e os detalhes para nosso WhatsApp.
            </p>

            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block w-full">
                <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center justify-center gap-2 h-12 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Confirmar no WhatsApp
                </Button>
              </a>
            )}
          </div>
        )}

        <div className="pt-8">
          <Link href="/products" className="text-sm text-muted-foreground hover:underline">
            Voltar para a loja
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-20 px-4 text-center">
        <Loader2 className="h-24 w-24 text-red-500 animate-spin mx-auto mb-4" />
        <p>Carregando...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
