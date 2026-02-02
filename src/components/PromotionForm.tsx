"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Promotion } from "@/types";
import { uploadFile } from "@/services/storageService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const promotionSchema = z.object({
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().min(1, "Imagem é obrigatória"),
  link: z.string().optional().nullable(),
  position: z.enum(['main_carousel', 'grid_left', 'grid_top_right', 'grid_bottom_left', 'grid_bottom_right']).default('main_carousel'),
});

type PromotionFormValues = z.infer<typeof promotionSchema>;

const DEFAULT_PLACEHOLDER_IMAGE = "https://placehold.co/800x400?text=Banner+Preview";

interface PromotionFormProps {
  promotion?: Promotion | null;
  onSubmitPromotion: (data: Promotion, isEditing: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PromotionForm({ promotion, onSubmitPromotion, open, onOpenChange }: PromotionFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      link: "",
      position: "main_carousel",
    },
  });

  useEffect(() => {
    if (open) {
      if (promotion) {
        form.reset({
          title: promotion.title || "",
          description: promotion.description || "",
          imageUrl: promotion.imageUrl,
          link: promotion.link || "",
          position: promotion.position || "main_carousel",
        });
        setImagePreview(promotion.imageUrl);
      } else {
        form.reset({
          title: "",
          description: "",
          imageUrl: "",
          link: "",
          position: "main_carousel",
        });
        setImagePreview(DEFAULT_PLACEHOLDER_IMAGE);
      }
    }
  }, [promotion, form, open]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const publicUrl = await uploadFile(file, 'banners');
        setImagePreview(publicUrl);
        form.setValue("imageUrl", publicUrl, { shouldValidate: true });
        toast({ title: "Sucesso", description: "Imagem do banner enviada com sucesso." });
      } catch (error) {
        console.error("Error uploading banner", error);
        toast({ title: "Erro", description: "Falha ao enviar imagem.", variant: "destructive" });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (data: PromotionFormValues) => {
    const finalData: Promotion = {
      id: promotion?.id || `promo-${Date.now()}`,
      title: data.title || "",
      description: data.description || "",
      imageUrl: data.imageUrl,
      link: data.link || "",
      position: data.position as any,
    };
    onSubmitPromotion(finalData, !!promotion);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{promotion ? "Editar Banner" : "Novo Banner"}</SheetTitle>
          <SheetDescription>
            {promotion ? "Altere as informações do banner." : "Preencha os dados do novo banner."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título Principal <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Queima de Estoque" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtítulo / Descrição <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Até 50% OFF em selecionados" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link de Destino <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: /products?category=WHEY" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posição de Exibição</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione onde o banner vai aparecer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="main_carousel">Carrossel Principal (Topo)</SelectItem>
                      <SelectItem value="grid_left">Destaque Esquerda (Grande)</SelectItem>
                      <SelectItem value="grid_top_right">Destaque Topo Direita (Largo)</SelectItem>
                      <SelectItem value="grid_bottom_left">Destaque Baixo Esquerda (Pequeno)</SelectItem>
                      <SelectItem value="grid_bottom_right">Destaque Baixo Direita (Pequeno)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-4">
              <FormLabel>Imagem do Banner (URL ou Upload)</FormLabel>

              <div className="flex justify-center bg-muted/30 p-4 rounded-md border border-dashed border-muted-foreground/25">
                <div className="relative w-full aspect-[2/1]">
                  <Image
                    src={imagePreview || DEFAULT_PLACEHOLDER_IMAGE}
                    alt="Preview"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
              </div>

              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground text-center">Ou cole uma URL abaixo:</p>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="https://exemplo.com/banner.png"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (e.target.value) setImagePreview(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isUploading || form.formState.isSubmitting}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando Imagem...
                </>
              ) : (
                promotion ? "Salvar Banner" : "Criar Banner"
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
