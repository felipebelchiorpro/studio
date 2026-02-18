"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Promotion } from "@/types";
// import { fetchPromotionsService } from "@/services/promotionService"; // Deprecated
import { createPromotion, updatePromotion, deletePromotion, fetchPromotions } from "@/app/actions/promotions"; // Import fetchPromotions
import PromotionForm from "@/components/PromotionForm";

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const { toast } = useToast();

    const loadPromotions = async () => {
        try {
            const data = await fetchPromotions();
            setPromotions(data);
        } catch (error) {
            console.error("Failed to fetch promotions", error);
            toast({
                title: "Erro ao carregar banners",
                description: "Não foi possível carregar a lista de banners.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        loadPromotions();
    }, []);

    const filteredPromotions = promotions.filter((promo) =>
        (promo.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreatePromotion = () => {
        setEditingPromotion(null);
        setIsFormOpen(true);
    };

    const handleEditPromotion = (promo: Promotion) => {
        setEditingPromotion(promo);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            try {
                await deletePromotion(deleteId);
                toast({
                    title: "Banner removido",
                    description: "O banner foi removido com sucesso.",
                });
                loadPromotions();
            } catch (error) {
                console.error("Failed to delete promotion", error);
                toast({
                    title: "Erro ao remover",
                    description: "Não foi possível remover o banner.",
                    variant: "destructive",
                });
            } finally {
                setDeleteId(null);
            }
        }
    };

    const handleFormSubmit = async (data: Promotion) => {
        try {
            if (editingPromotion) {
                await updatePromotion(data);
                toast({
                    title: "Banner atualizado",
                    description: "As alterações foram salvas com sucesso.",
                });
            } else {
                await createPromotion(data);
                toast({
                    title: "Banner criado",
                    description: "O novo banner foi adicionado com sucesso.",
                });
            }
            loadPromotions();
            setIsFormOpen(false);
        } catch (error) {
            console.error("Failed to save promotion", error);
            toast({
                title: "Erro ao salvar",
                description: "Ocorreu um erro ao tentar salvar o banner.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Banners da Loja</h2>
                    <p className="text-muted-foreground mt-2">
                        Gerencie os banners e destaques exibidos na página inicial (Carrossel).
                    </p>
                </div>
                <Button onClick={handleCreatePromotion}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Banner
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar banners..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Visual</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead className="hidden md:table-cell">Descrição</TableHead>
                            <TableHead className="hidden md:table-cell">Link</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPromotions.length > 0 ? (
                            filteredPromotions.map((promo) => (
                                <TableRow key={promo.id}>
                                    <TableCell>
                                        <div className="relative h-12 w-24 rounded-md overflow-hidden bg-muted">
                                            {promo.imageUrl ? (
                                                <Image src={promo.imageUrl} alt={promo.title} layout="fill" objectFit="cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full w-full text-xs text-muted-foreground">Sem img</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{promo.title}</TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground">{promo.description}</TableCell>
                                    <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground truncate max-w-[150px]">{promo.link}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditPromotion(promo)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(promo.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Nenhum banner encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <PromotionForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                promotion={editingPromotion}
                onSubmitPromotion={handleFormSubmit}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o banner da loja.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
