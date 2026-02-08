'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Tag, Percent, DollarSign, Calendar } from 'lucide-react';
import { createCouponService, deleteCouponService, toggleCouponStatusService, fetchCouponsService, Coupon } from '@/services/couponService';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from 'lucide-react';

type Partner = {
    id: string;
    name: string;
    code: string;
};

type CouponManagerProps = {
    initialCoupons: Coupon[];
    partners: Partner[];
};

export default function CouponManager({ initialCoupons, partners }: CouponManagerProps) {
    // We use props as initial state if we want optimistic updates, 
    // but Server Actions with revalidatePath usually handle updates well by refreshing the route.
    // However, passing initialCoupons to a state might be useful for immediate feedback or filtering.
    // For simplicity, we'll rely on the server re-rendering the page and passing fresh props, 
    // but here we are a client component consuming data passed from server component.
    // Actually, Next.js Server Actions refresh the page, so props will update.

    // So we don't strictly need local state for the list unless implementing client-side filtering.
    // Let's use the props directly rendered.

    const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const refreshCoupons = async () => {
        const data = await fetchCouponsService();
        setCoupons(data);
    };

    // Form State
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
    const [discountValue, setDiscountValue] = useState('');
    const [usageLimit, setUsageLimit] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [selectedPartner, setSelectedPartner] = useState<string>(''); // Changed to string input
    const [isPartnerCoupon, setIsPartnerCoupon] = useState(false);

    const resetForm = () => {
        setCode('');
        setDiscountType('percent');
        setDiscountValue('');
        setUsageLimit('');
        setExpirationDate('');
        setSelectedPartner('');
        setIsPartnerCoupon(false);
    };

    const handleCreateWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !discountValue) {
            toast({ title: "Erro", description: "Preencha os campos obrigatórios.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const res = await createCouponService({
                code,
                discount_type: discountType,
                discount_value: Number(discountValue),
                usage_limit: usageLimit ? Number(usageLimit) : null,
                expiration_date: expirationDate ? new Date(expirationDate).toISOString() : null,
                active: true,
                partner_name: isPartnerCoupon && selectedPartner ? selectedPartner : null
            });

            if (res.success) {
                toast({ title: "Sucesso", description: "Cupom criado com sucesso!", className: "bg-green-600 text-white" });
                setIsDialogOpen(false);
                resetForm();
                refreshCoupons();
            } else {
                toast({ title: "Erro", description: res.message || "Erro ao criar cupom.", variant: "destructive" });
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Ocorreu um erro inesperado.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

        const res = await deleteCouponService(id);
        if (res.success) {
            toast({ title: "Cupom excluído", description: "O cupom foi removido com sucesso." });
            refreshCoupons();
        } else {
            toast({ title: "Erro", description: "Erro ao excluir cupom.", variant: "destructive" });
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const res = await toggleCouponStatusService(id, currentStatus);
        if (!res.success) {
            toast({ title: "Erro", description: "Erro ao atualizar status.", variant: "destructive" });
        } else {
            refreshCoupons();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Cupons</h2>
                    <p className="text-muted-foreground">Gerencie os cupons de desconto da loja.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#16a34a] hover:bg-[#15803d] text-white">
                            <Plus className="mr-2 h-4 w-4" /> Criar Cupom
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Criar Novo Cupom</DialogTitle>
                            <DialogDescription>
                                Preencha os detalhes do cupom abaixo.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateWrapper} className="grid gap-4 py-4">
                            <div className="flex items-center justify-end gap-2 mb-2">
                                <Label htmlFor="partner-mode" className="cursor-pointer">Vincular a Parceiro?</Label>
                                <Switch
                                    id="partner-mode"
                                    checked={isPartnerCoupon}
                                    onCheckedChange={setIsPartnerCoupon}
                                />
                            </div>

                            {isPartnerCoupon && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="partner" className="text-right">Nome do Parceiro</Label>
                                    <div className="col-span-3">
                                        <Input
                                            id="partner"
                                            value={selectedPartner}
                                            onChange={(e) => setSelectedPartner(e.target.value)}
                                            placeholder="Ex: Felipe Belchior"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="code" className="text-right">Código</Label>
                                <Input
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="col-span-3 uppercase"
                                    placeholder="EX: PROMO10"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">Tipo</Label>
                                <div className="col-span-3">
                                    <Select value={discountType} onValueChange={(val: 'percent' | 'fixed') => setDiscountType(val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percent">Porcentagem (%)</SelectItem>
                                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="value" className="text-right">Valor</Label>
                                <div className="col-span-3 relative">
                                    <Input
                                        id="value"
                                        type="number"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                        placeholder={discountType === 'percent' ? "10" : "15.00"}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="limit" className="text-right">Limite de Uso</Label>
                                <Input
                                    id="limit"
                                    type="number"
                                    value={usageLimit}
                                    onChange={(e) => setUsageLimit(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Opcional (infinito)"
                                    min="1"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">Expiração</Label>
                                <Input
                                    id="date"
                                    type="datetime-local" // Keep simple for now
                                    value={expirationDate}
                                    onChange={(e) => setExpirationDate(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Criando..." : "Salvar Cupom"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">Cupons Gerais</TabsTrigger>
                    <TabsTrigger value="partners">Cupons de Parceiros</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <CouponList
                        coupons={coupons.filter(c => !c.partner_name && !c.partner_id)}
                        handleToggle={handleToggle}
                        handleDelete={handleDelete}
                    />
                </TabsContent>

                <TabsContent value="partners">
                    <CouponList
                        coupons={coupons.filter(c => c.partner_name || c.partner_id)}
                        handleToggle={handleToggle}
                        handleDelete={handleDelete}
                        isPartnerView
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function CouponList({ coupons, handleToggle, handleDelete, isPartnerView = false }: {
    coupons: Coupon[],
    handleToggle: (id: string, status: boolean) => void,
    handleDelete: (id: string) => void,
    isPartnerView?: boolean
}) {
    if (coupons.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg mt-4">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Nenhum cupom encontrado</h3>
                <p className="text-muted-foreground">Crie novos cupons para vê-los aqui.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {coupons.map((coupon) => (
                <Card key={coupon.id} className={`${!coupon.active ? 'opacity-60' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            {isPartnerView && (
                                <div className="text-xs font-semibold text-primary flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {coupon.partner_name || coupon.partners?.name || 'Parceiro'}
                                </div>
                            )}
                            <CardTitle className="text-sm font-medium">
                                {coupon.code}
                            </CardTitle>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={coupon.active}
                                onCheckedChange={() => handleToggle(coupon.id, coupon.active)}
                            />
                            <Button variant="ghost" size="icon" className="h-4 w-4 text-destructive" onClick={() => handleDelete(coupon.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {coupon.discount_type === 'percent' ? <Percent className="h-5 w-5 text-muted-foreground" /> : <DollarSign className="h-5 w-5 text-muted-foreground" />}
                            {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value.toFixed(2)}`}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                            {coupon.used_count} usos
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {coupon.usage_limit ? `Limite: ${coupon.usage_limit}` : 'Sem limite'}
                        </p>
                        {coupon.expiration_date && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                Expira em: {new Date(coupon.expiration_date).toLocaleDateString()}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

