import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Zap, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold text-primary mb-4">Sobre a DarkStore Suplementos</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Elevando sua performance com a força e qualidade que você merece.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
        <div>
          <h2 className="font-headline text-3xl font-semibold text-foreground mb-4">Nossa Missão</h2>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Na DarkStore Suplementos, nossa missão é fornecer suplementos da mais alta qualidade, formulados cientificamente para otimizar seu desempenho físico, acelerar sua recuperação e promover um estilo de vida saudável e ativo. Acreditamos que todos têm o potencial de alcançar seus objetivos de fitness, e estamos aqui para fornecer as ferramentas certas para essa jornada.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Comprometemo-nos com a transparência, a inovação e a excelência em cada produto que oferecemos. Do atleta de elite ao entusiasta do fitness, a DarkStore é sua parceira confiável na busca por resultados extraordinários.
          </p>
        </div>
        <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl bg-black/40 flex items-center justify-center border border-white/10 p-8">
          <div className="relative w-full h-full">
            <Image
              src="/darkstore-logo.png"
              alt="Logo DarkStore Suplementos"
              layout="fill"
              objectFit="contain"
              className="transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
              data-ai-hint="fitness team supplements"
            />
          </div>
        </div>
      </div>

      <Card className="bg-card shadow-lg mb-16">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-center text-primary">Nossos Valores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <Zap className="h-12 w-12 text-accent mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-foreground mb-1">Performance</h3>
              <p className="text-sm text-muted-foreground">Foco em produtos que entregam resultados reais e impulsionam seu desempenho.</p>
            </div>
            <div className="p-4">
              <ShieldCheck className="h-12 w-12 text-accent mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-foreground mb-1">Qualidade</h3>
              <p className="text-sm text-muted-foreground">Seleção rigorosa de ingredientes e processos de fabricação para garantir a pureza e eficácia.</p>
            </div>
            <div className="p-4">
              <Target className="h-12 w-12 text-accent mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-foreground mb-1">Compromisso</h3>
              <p className="text-sm text-muted-foreground">Dedicados a apoiar seus objetivos de saúde e fitness com produtos confiáveis.</p>
            </div>
            <div className="p-4">
              <Users className="h-12 w-12 text-accent mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-foreground mb-1">Comunidade</h3>
              <p className="text-sm text-muted-foreground">Construindo uma comunidade forte e motivada em torno de um estilo de vida ativo.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <h2 className="font-headline text-3xl font-semibold text-foreground mb-4">Junte-se à Nação DarkStore</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Explore nossa linha de produtos e sinta a diferença que a suplementação de qualidade pode fazer. Estamos ansiosos para fazer parte da sua jornada de sucesso!
        </p>
        {/* You can add a <Link href="/products"><Button>...</Button></Link> here */}
      </div>
    </div>
  );
}
