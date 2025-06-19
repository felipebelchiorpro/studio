
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockOrders, mockProducts, mockCategories, mockDashboardMetrics } from "@/data/mockData";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, AlertTriangle, Percent, UserPlus, ListOrdered, BarChartHorizontal, Filter, Brain, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS_PIE = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

export default function DashboardPage() {
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = mockOrders.length;
  const totalProducts = mockProducts.length;
  const lowStockItems = mockProducts.filter(p => p.stock < 10).length;

  const ticketMedio = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const taxaConversao = mockDashboardMetrics.totalSessions > 0 ? (totalOrders / mockDashboardMetrics.totalSessions) * 100 : 0;
  
  const newVsReturningData = [
    { name: 'Novos Clientes', value: mockDashboardMetrics.newCustomers },
    { name: 'Clientes Recorrentes', value: mockDashboardMetrics.returningCustomers },
  ];

  const summaryCards = [
    { title: "Receita Total", value: `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`, icon: DollarSign, link: "/dashboard/sales", color: "text-green-500", trend: "+5.2% vs mês anterior" },
    { title: "Total de Pedidos", value: totalOrders.toString(), icon: ShoppingCart, link: "/dashboard/sales", color: "text-blue-500" },
    { title: "Ticket Médio", value: `R$ ${ticketMedio.toFixed(2).replace('.', ',')}`, icon: TrendingUp, link: "/dashboard/sales", color: "text-yellow-500" },
    { title: "Taxa de Conversão", value: `${taxaConversao.toFixed(2)}%`, icon: Percent, link: "#", color: "text-teal-500" },
    { title: "Novos Clientes", value: mockDashboardMetrics.newCustomers.toString(), icon: UserPlus, link: "#", color: "text-sky-500" },
    { title: "Produtos Cadastrados", value: totalProducts.toString(), icon: Package, link: "/dashboard/products", color: "text-purple-500" },
    { title: "Baixo Estoque", value: lowStockItems.toString(), icon: AlertTriangle, link: "/dashboard/stock", color: lowStockItems > 0 ? "text-red-500" : "text-yellow-600" },
  ];
  
  const salesByMonthData = mockOrders.reduce((acc, order) => {
    const month = new Date(order.orderDate).toLocaleString('default', { month: 'short' });
    const existingMonth = acc.find(item => item.month === month);
    if (existingMonth) {
      existingMonth.total += order.totalAmount;
    } else {
      acc.push({ month, total: order.totalAmount });
    }
    return acc;
  }, [] as { month: string; total: number }[]).sort((a,b) => new Date(`01 ${a.month} 2000`) > new Date(`01 ${b.month} 2000`) ? 1 : -1);

  const topProductsData = [...mockProducts]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 5)
    .map(p => ({ name: p.name, Vendas: p.salesCount || 0 }));

  const topCategoriesData = [...mockCategories]
    .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
    .slice(0, 5)
    .map(c => ({ name: c.name, Receita: c.totalRevenue || 0 }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="font-headline text-3xl font-bold text-foreground">Visão Geral do Dashboard</h1>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Select defaultValue="last30days">
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="last7days">Últimos 7 dias</SelectItem>
              <SelectItem value="last30days">Últimos 30 dias</SelectItem>
              <SelectItem value="thisMonth">Mês Atual</SelectItem>
              <SelectItem value="thisQuarter">Trimestre Atual</SelectItem>
              <SelectItem value="thisYear">Ano Atual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              {card.trend && <p className="text-xs text-muted-foreground">{card.trend}</p>}
              {card.link !== "#" && (
                <Link href={card.link} passHref>
                  <Button variant="link" className="text-xs text-muted-foreground px-0 hover:text-primary -ml-1">
                    Ver detalhes
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Performance de Vendas Mensal</CardTitle>
            <CardDescription>Receita total por mês (dados simulados).</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByMonthData}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: 'hsl(var(--muted))', opacity: 0.3}}
                  contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                  labelStyle={{color: 'hsl(var(--foreground))'}}
                />
                <Legend wrapperStyle={{fontSize: '12px'}}/>
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Receita"/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Novos Clientes vs Recorrentes</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <RechartsTooltip 
                    contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                    labelStyle={{color: 'hsl(var(--foreground))'}}
                />
                <Pie data={newVsReturningData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {newVsReturningData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{fontSize: '12px'}} layout="horizontal" verticalAlign="bottom" align="center" />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><ListOrdered className="mr-2 h-5 w-5 text-primary"/> Top 5 Produtos Mais Vendidos</CardTitle>
            <CardDescription>Produtos com maior quantidade de vendas.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ left: 30, right: 30 }}>
                 <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={120} interval={0} />
                <RechartsTooltip 
                  cursor={{fill: 'hsl(var(--muted))', opacity: 0.3}}
                  contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                  labelStyle={{color: 'hsl(var(--foreground))'}}
                />
                <Legend wrapperStyle={{fontSize: '12px'}}/>
                <Bar dataKey="Vendas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><BarChartHorizontal className="mr-2 h-5 w-5 text-primary"/> Top 5 Categorias Mais Rentáveis</CardTitle>
            <CardDescription>Categorias com maior receita gerada.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategoriesData} layout="vertical" margin={{ left: 30, right: 30 }}>
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={120} interval={0}/>
                 <RechartsTooltip 
                  cursor={{fill: 'hsl(var(--muted))', opacity: 0.3}}
                  contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                  labelStyle={{color: 'hsl(var(--foreground))'}}
                   formatter={(value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`}
                />
                <Legend wrapperStyle={{fontSize: '12px'}}/>
                <Bar dataKey="Receita" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} barSize={20}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Vendas Recentes</CardTitle>
            <CardDescription>Últimos 5 pedidos processados.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {mockOrders.slice(0, 5).map(order => (
                <li key={order.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-foreground">Pedido #{order.id.slice(0,6)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                     <p className={`text-sm font-semibold ${order.status === 'Delivered' ? 'text-green-500' : order.status === 'Shipped' ? 'text-blue-500' : 'text-yellow-500'}`}>{order.status}</p>
                     <p className="text-xs text-muted-foreground">R$ {order.totalAmount.toFixed(2).replace('.',',')}</p>
                  </div>
                </li>
              ))}
            </ul>
             <Link href="/dashboard/sales" passHref>
                <Button variant="outline" className="w-full mt-4">Ver todos os pedidos</Button>
              </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Filter className="mr-2 h-5 w-5 text-primary" /> Funil de Vendas (Simulado)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {mockDashboardMetrics.funnelData.map((stage, index) => (
              <div key={stage.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{stage.name}</span>
                  <span className="font-semibold text-foreground">{stage.value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${(stage.value / mockDashboardMetrics.funnelData[0].value) * 100}%` }}
                  ></div>
                </div>
                 {index < mockDashboardMetrics.funnelData.length -1 && (
                    <p className="text-xs text-right text-muted-foreground mt-0.5">
                       Conversão: {
                        mockDashboardMetrics.funnelData[index+1].value > 0 && stage.value > 0 ? 
                        ((mockDashboardMetrics.funnelData[index+1].value / stage.value) * 100).toFixed(1) + '%' : '0%'
                       } para próxima etapa
                    </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center"><Brain className="mr-2 h-5 w-5 text-primary" /> Insights da IA</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Notamos uma queda de 20% na conversão de 'Whey Protein Sabor Chocolate' esta semana. Sugerimos criar uma promoção de frete grátis para este item. (Placeholder)
                    </p>
                     <Button variant="link" className="text-xs px-0 -ml-1 mt-1">Ver mais insights</Button>
                </CardContent>
            </Card>
            <Card className="shadow-md">
                 <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary" /> Mapa de Calor de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Visualização de vendas por região. (Placeholder - Implementação Futura)
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
