
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import type { Promotion } from "@/types";
import { useEffect, useState } from "react";
import Image from "next/image";

const promotionSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres." }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres." }),
  link: z.string().min(1, { message: "O link é obrigatório." }).url({ message: "Por favor, insira uma URL válida." }),
  imageUrl: z.string().min(1, { message: "É necessário uma imagem." }),
});

type PromotionFormValues = z.infer<typeof promotionSchema>;

interface PromotionFormProps {
  promotion?: Promotion | null; 
  onSubmit: (data: Promotion, isEditing: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_PLACEHOLDER_IMAGE = "https://placehold.co/1200x400.png";

export default function PromotionForm({ promotion, onSubmit, open, onOpenChange }: PromotionFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      imageUrl: DEFAULT_PLACEHOLDER_IMAGE,
    },
  });
  
  useEffect(() => {
    if (open) { 
      if (promotion) {
        form.reset({
          title: promotion.title,
          description: promotion.description,
          link: promotion.link,
          imageUrl: promotion.imageUrl || DEFAULT_PLACEHOLDER_IMAGE,
        });
        setImagePreview(promotion.imageUrl || DEFAULT_PLACEHOLDER_IMAGE);
      } else {
        form.reset({ 
          title: "",
          description: "",
          link: "",
          imageUrl: DEFAULT_PLACEHOLDER_IMAGE,
        });
        setImagePreview(DEFAULT_PLACEHOLDER_IMAGE); 
      }
    }
  }, [promotion, form, open]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue("imageUrl", dataUri, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    } else {
      const revertUrl = promotion?.imageUrl || DEFAULT_PLACEHOLDER_IMAGE;
      setImagePreview(revertUrl);
      form.setValue("imageUrl", revertUrl);
    }
  };

  const handleSubmit = (data: PromotionFormValues) => {
    const finalData: Promotion = {
      ...data,
      id: promotion?.id || `promo-temp-${Date.now()}`, 
      imageUrl: data.imageUrl,
    };
    onSubmit(finalData, !!promotion);
    onOpenChange(false); 
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card text-card-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">
            {promotion ? "Editar Banner" : "Adicionar Novo Banner"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do banner promocional.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right col-span-1">Título</Label>
              <div className="col-span-3">
                <Input id="title" {...form.register("title")} className={form.formState.errors.title ? "border-destructive" : ""} />
                {form.formState.errors.title && <p className="text-xs text-destructive mt-1">{form.formState.errors.title.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right col-span-1 pt-2">Descrição</Label>
              <div className="col-span-3">
                <Textarea id="description" {...form.register("description")} className={form.formState.errors.description ? "border-destructive" : ""} />
                {form.formState.errors.description && <p className="text-xs text-destructive mt-1">{form.formState.errors.description.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right col-span-1">Link</Label>
              <div className="col-span-3">
                <Input id="link" placeholder="/products?category=GANHO%20DE%20MASSA" {...form.register("link")} className={form.formState.errors.link ? "border-destructive" : ""} />
                {form.formState.errors.link && <p className="text-xs text-destructive mt-1">{form.formState.errors.link.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="imageUpload" className="text-right col-span-1 pt-2">Imagem</Label>
              <div className="col-span-3">
                <Input 
                  id="imageUpload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className={form.formState.errors.imageUrl ? "border-destructive" : ""} 
                />
                {imagePreview && (
                  <div className="mt-2 relative w-full aspect-[16/7] rounded border border-muted overflow-hidden bg-muted">
                    <Image src={imagePreview} alt="Pré-visualização do banner" layout="fill" objectFit="cover" data-ai-hint="promotion banner preview"/>
                  </div>
                )}
                {form.formState.errors.imageUrl && !imagePreview && (
                   <p className="text-xs text-destructive mt-1">{form.formState.errors.imageUrl.message}</p>
                )}
                <input type="hidden" {...form.register("imageUrl")} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="button" onClick={form.handleSubmit(handleSubmit)} disabled={form.formState.isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {form.formState.isSubmitting ? "Salvando..." : "Salvar Banner"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
