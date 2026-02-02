
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePromotion } from '@/context/PromotionContext';
import type { Promotion } from '@/types';
import { PlusCircle, Edit, Trash2, Image as ImageIcon, Link as LinkIcon, Heading2, Text, Palette } from 'lucide-react';
import PromotionForm from '@/components/PromotionForm';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Image from "next/image";

export default function AppearancePage() {
    const { promotions, addPromotion, updatePromotion, deletePromotion, loading } = usePromotion();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
    const { toast } = useToast();

    const handleAddPromotion = () => {
        setEditingPromotion(null);
        setIsFormOpen(true);
    };

    const handleEditPromotion = (promotion: Promotion) => {
        setEditingPromotion(promotion);
        setIsFormOpen(true);
    };

    const handleDeletePromotion = (promotion: Promotion) => {
        setPromotionToDelete(promotion);
    };

    const confirmDelete = () => {
        if (promotionToDelete) {
            deletePromotion(promotionToDelete.id);
            toast({ title: "Banner Removido", description: `O banner "${promotionToDelete.title}" foi removido.` });
            setPromotionToDelete(null);
        }
    };

    const handleSubmitPromotion = (data: Promotion, isEditing: boolean) => {
        if (isEditing) {
            updatePromotion(data);
            toast({ title: "Banner Atualizado", description: `"${data.title}" foi atualizado.` });
        } else {
            addPromotion(data);
            toast({ title: "Banner Adicionado", description: `"${data.title}" foi adicionado.` });
        }
        setIsFormOpen(false);
        setEditingPromotion(null);
    };

    return (
        <div className="space-y-6">
            <h1 className="font-headline text-3xl font-bold text-foreground flex items-center">
                <Palette className="mr-3 h-8 w-8 text-primary" /> Aparência da Loja
            </h1>

            <Card className="shadow-lg">
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle>Banners da Página Inicial</CardTitle>
                        <CardDescription>Gerencie os banners que aparecem no carrossel da sua página inicial.</CardDescription>
                    </div>
                    <Button onClick={handleAddPromotion}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Banner
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading ? (
                            <p>Carregando banners...</p>
                        ) : promotions.length > 0 ? (
                            promotions.map(promo => (
                                <div key={promo.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-muted/30">
                                    <div className="relative w-full sm:w-48 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                        <Image src={promo.imageUrl} alt={promo.title} layout="fill" objectFit="cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-lg text-foreground">{promo.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{promo.description}</p>
                                        <p className="text-xs text-primary mt-1">Link: {promo.link}</p>
                                    </div>
                                    <div className="flex gap-2 self-start sm:self-center">
                                        <Button variant="outline" size="icon" onClick={() => handleEditPromotion(promo)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleDeletePromotion(promo)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-4">Nenhum banner cadastrado ainda.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <PromotionForm
                promotion={editingPromotion}
                onSubmitPromotion={handleSubmitPromotion}
                open={isFormOpen}
                onOpenChange={(isOpen) => {
                    setIsFormOpen(isOpen);
                    if (!isOpen) setEditingPromotion(null);
                }}
            />

            <AlertDialog open={!!promotionToDelete} onOpenChange={() => setPromotionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover o banner "{promotionToDelete?.title}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPromotionToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
