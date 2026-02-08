'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Loader2, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchShippingRatesService, createShippingRateService, updateShippingRateService, deleteShippingRateService, ShippingRate } from '@/services/shippingService';

export default function ShippingPage() {
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);
    const { toast } = useToast();

    // Form inputs
    const [cityName, setCityName] = useState('');
    const [baseFee, setBaseFee] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');

    const fetchRates = async () => {
        setIsLoading(true);
        const data = await fetchShippingRatesService();
        setRates(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchRates();
    }, []);

    const openCreateDialog = () => {
        setEditingRate(null);
        setCityName('');
        setBaseFee('');
        setDeliveryTime('');
        setIsDialogOpen(true);
    };

    const openEditDialog = (rate: ShippingRate) => {
        setEditingRate(rate);
        setCityName(rate.city_name);
        setBaseFee(rate.base_fee.toString());
        setDeliveryTime(rate.estimated_delivery_time);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!cityName || !baseFee) {
            toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
            return;
        }

        const payload = {
            city_name: cityName,
            base_fee: parseFloat(baseFee),
            estimated_delivery_time: deliveryTime || 'Variável'
        };

        let res;
        if (editingRate) {
            res = await updateShippingRateService(editingRate.id, payload);
        } else {
            res = await createShippingRateService(payload);
        }

        if (res.success) {
            toast({ title: "Sucesso", description: `Frete ${editingRate ? 'atualizado' : 'criado'}.` });
            setIsDialogOpen(false);
            fetchRates();
        } else {
            toast({ title: "Erro", description: res.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja remover esta cidade?')) {
            const res = await deleteShippingRateService(id);
            if (res.success) {
                toast({ title: "Removido", description: "Cidade removida das entregas." });
                fetchRates();
            } else {
                toast({ title: "Erro", description: res.message, variant: "destructive" });
            }
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        // Optimistic
        setRates(prev => prev.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r));

        const res = await updateShippingRateService(id, { is_active: !currentStatus });
        if (!res.success) {
            fetchRates(); // Revert on failure
            toast({ title: "Erro", description: res.message, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Frete e Entrega</h2>
                    <p className="text-muted-foreground">Gerencie as cidades e taxas de entrega.</p>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Cidade
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Cidades Atendidas</CardTitle>
                    <CardDescription>Lista de locais onde a entrega está disponível.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Cidade</TableHead>
                                    <TableHead>Taxa de Entrega</TableHead>
                                    <TableHead>Tempo Estimado</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rates.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Nenhuma cidade cadastrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {rates.map((rate) => (
                                    <TableRow key={rate.id}>
                                        <TableCell>
                                            <Switch
                                                checked={rate.is_active}
                                                onCheckedChange={() => handleToggleActive(rate.id, rate.is_active)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{rate.city_name}</TableCell>
                                        <TableCell>R$ {rate.base_fee.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Truck className="h-4 w-4 text-muted-foreground" />
                                                {rate.estimated_delivery_time}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(rate)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(rate.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRate ? 'Editar Cidade' : 'Nova Cidade'}</DialogTitle>
                        <DialogDescription>
                            Configure as informações de entrega para esta localidade.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="city" className="text-right">
                                Cidade
                            </Label>
                            <Input
                                id="city"
                                value={cityName}
                                onChange={(e) => setCityName(e.target.value)}
                                className="col-span-3"
                                placeholder="Ex: Caconde"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="fee" className="text-right">
                                Taxa (R$)
                            </Label>
                            <Input
                                id="fee"
                                type="number"
                                value={baseFee}
                                onChange={(e) => setBaseFee(e.target.value)}
                                className="col-span-3"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">
                                Tempo
                            </Label>
                            <Input
                                id="time"
                                value={deliveryTime}
                                onChange={(e) => setDeliveryTime(e.target.value)}
                                className="col-span-3"
                                placeholder="Ex: 40-60 min"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleSave}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
