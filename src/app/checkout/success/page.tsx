
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="flex items-center justify-center py-16 sm:py-24">
      <Card className="w-full max-w-lg text-center shadow-2xl">
        <CardHeader className="items-center">
            <div className="p-3 bg-green-500/20 rounded-full mb-3">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="font-headline text-3xl text-primary">Pagamento Aprovado!</CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-1">
                Seu pedido foi recebido com sucesso.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Obrigado pela sua compra! Preparamos seu pedido para envio e você receberá uma notificação por e-mail com os detalhes e o código de rastreamento em breve.
          </p>
          <div className="text-sm text-muted-foreground border-t border-border/40 pt-4">
            <p><strong>Número do Pedido (simulado):</strong> DK-{Date.now()}</p>
            <p><strong>Status:</strong> Em processamento</p>
          </div>
        </CardContent>
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
            <Link href="/" passHref className='flex-1'>
                <Button variant="outline" className="w-full">
                    <ShoppingBag className="mr-2 h-4 w-4"/> Continuar Comprando
                </Button>
            </Link>
            <Link href="/account/dashboard" passHref className='flex-1'>
                <Button className="w-full">
                    Ver Meus Pedidos
                </Button>
            </Link>
        </div>
      </Card>
    </div>
  );
}
