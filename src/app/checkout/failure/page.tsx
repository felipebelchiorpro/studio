
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutFailurePage() {
  return (
    <div className="flex items-center justify-center py-16 sm:py-24">
      <Card className="w-full max-w-lg text-center shadow-2xl">
        <CardHeader className="items-center">
            <div className="p-3 bg-red-500/20 rounded-full mb-3">
                <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="font-headline text-3xl text-destructive">Falha no Pagamento</CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-1">
                Não foi possível processar seu pagamento.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Ocorreu um erro ao tentar processar seu pagamento. Por favor, verifique os dados inseridos ou tente usar um método de pagamento diferente. Nenhum valor foi cobrado.
          </p>
        </CardContent>
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
            <Link href="/cart" passHref className='flex-1'>
                <Button variant="outline" className="w-full">
                    <ShoppingCart className="mr-2 h-4 w-4"/> Tentar Novamente
                </Button>
            </Link>
            <Link href="/" passHref className='flex-1'>
                <Button className="w-full">
                    Voltar para a Loja
                </Button>
            </Link>
        </div>
      </Card>
    </div>
  );
}
