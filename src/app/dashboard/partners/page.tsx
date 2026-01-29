"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPartners, createPartner, deletePartner } from "@/actions/partners";
import type { Partner } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function PartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchPartners = async () => {
        setLoading(true);
        const data = await getPartners();
        setPartners(data as Partner[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        const result = await createPartner(formData);

        if (result.error) {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Sucesso", description: "Parceiro criado com sucesso!" });
            setIsDialogOpen(false);
            fetchPartners();
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este parceiro?")) return;

        const result = await deletePartner(id);
        if (result.error) {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Parceiro removido", description: "O parceiro foi removido com sucesso." });
            fetchPartners();
        }
    }

    return (
        <div className="space-y-8 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Parceiros & Afiliados</h2>
                    <p className="text-muted-foreground">Gerencie seus parceiros e acompanhe o desempenho.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#16a34a] hover:bg-[#15803d] text-white">
                            <Plus className="mr-2 h-4 w-4" /> Novo Parceiro
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
                        <DialogHeader>
                            <DialogTitle>Adicionar Parceiro</DialogTitle>
                            <DialogDescription>
                                Crie um código de cupom exclusivo para seu parceiro.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Nome
                                    </Label>
                                    <Input id="name" name="name" placeholder="Ex: @joaosilva_fit" className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="code" className="text-right">
                                        Código
                                    </Label>
                                    <Input id="code" name="code" placeholder="Ex: JOAO10" className="col-span-3 uppercase" required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Criando..." : "Criar Parceiro"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Parceiros</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{partners.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pontuação Total</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {partners.reduce((acc, p) => acc + (p.score || 0), 0)} pts
                        </div>
                        <p className="text-xs text-muted-foreground">Acumulado de todos os parceiros</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-card text-card-foreground">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Código (Cupom)</TableHead>
                            <TableHead>Pontuação (Vendas)</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Carregando...</TableCell>
                            </TableRow>
                        ) : partners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    Nenhum parceiro cadastrado. Adicione o primeiro!
                                </TableCell>
                            </TableRow>
                        ) : (
                            partners.map((partner) => (
                                <TableRow key={partner.id}>
                                    <TableCell className="font-medium">{partner.name}</TableCell>
                                    <TableCell className="font-mono text-primary uppercase">{partner.code}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Trophy className="h-4 w-4 text-yellow-500" />
                                            <span className="font-bold">{partner.score || 0}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(partner.id)} className="text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
