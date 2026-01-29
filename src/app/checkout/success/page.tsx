"use client";

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const { cartItems, clearCart, getCartTotal } = useCart();
  const [whatsappLink, setWhatsappLink] = useState('');
  const [savedItems, setSavedItems] = useState<any[]>([]);

  useEffect(() => {
    // 1. Save items to local state to display before clearing
    if (cartItems.length > 0) {
      setSavedItems(cartItems);

      // 2. Generate WhatsApp Message
      const total = getCartTotal();
      const orderId = `ORD-${Date.now().toString().slice(-6)}`; // Simple Client ID for ref

      let message = `*Olá! Fiz um pedido na loja online.*%0A%0A`;
      message += `*Pedido:* #${orderId}%0A`;
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

      // Replace with store number
      // Assuming env var or static for now
      const phoneNumber = '5511999999999'; // Replace with real one if available
      setWhatsappLink(`https://wa.me/${phoneNumber}?text=${message}`);

      // 3. Clear Cart
      // Small timeout to ensure state is captured
      setTimeout(() => {
        clearCart();
      }, 500);
    }
  }, [cartItems, getCartTotal, clearCart]);

  return (
    <div className="container mx-auto py-20 px-4 text-center">
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex justify-center">
          <CheckCircle2 className="h-24 w-24 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold">Pedido Confirmado!</h1>
        <p className="text-muted-foreground text-lg">
          Seu pagamento foi processado com sucesso.
        </p>

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

        <div className="pt-8">
          <Link href="/products" className="text-sm text-muted-foreground hover:underline">
            Voltar para a loja
          </Link>
        </div>
      </div>
    </div>
  );
}
