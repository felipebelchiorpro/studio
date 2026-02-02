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
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useState } from "react";
import Image from "next/image";
import { Brand } from "@/types";

import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/services/storageService";

const brandSchema = z.object({
    name: z.string().min(2, {
        message: "O nome da marca deve ter pelo menos 2 caracteres.",
    }),
    imageUrl: z.string().url({ message: "URL da logo inválida." }),
});

type BrandFormValues = z.infer<typeof brandSchema>;

const DEFAULT_PLACEHOLDER_IMAGE = "https://placehold.co/400x200?text=Logo";

interface BrandFormProps {
    onSubmitBrand: (data: Omit<Brand, 'id'>) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function BrandForm({ onSubmitBrand, open, onOpenChange }: BrandFormProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const form = useForm<BrandFormValues>({
        resolver: zodResolver(brandSchema),
        defaultValues: {
            name: "",
            imageUrl: "",
        },
    });

    // Reset form when opening
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            form.reset({
                name: "",
                imageUrl: "",
            });
            setImagePreview(null);
        }
        onOpenChange(isOpen);
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setIsUploading(true);
                const publicUrl = await uploadFile(file, 'brand-logos');
                setImagePreview(publicUrl);
                form.setValue("imageUrl", publicUrl);
                form.clearErrors("imageUrl");
                toast({ title: "Sucesso", description: "Logo da marca enviada com sucesso." });
            } catch (error) {
                console.error("Error uploading brand logo", error);
                toast({ title: "Erro", description: "Falha ao enviar logo.", variant: "destructive" });
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = (data: BrandFormValues) => {
        onSubmitBrand(data);
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Nova Marca</SheetTitle>
                    <SheetDescription>
                        Adicione uma nova marca parceira e sua logo.
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Marca</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Growth Supplements" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col gap-4">
                            <FormLabel>Logo da Marca (PNG Transparente)</FormLabel>

                            <div className="flex justify-center bg-white p-4 rounded-md border border-dashed border-muted-foreground/25">
                                <div className="relative w-full aspect-[2/1] max-w-[200px]">
                                    <Image
                                        src={imagePreview || DEFAULT_PLACEHOLDER_IMAGE}
                                        alt="Preview"
                                        layout="fill"
                                        objectFit="contain"
                                        className="rounded-md"
                                    />
                                </div>
                            </div>

                            <Input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
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
                                                placeholder="https://exemplo.com/logo.png"
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
                            <p className="text-xs text-muted-foreground">
                                Recomendado: Imagens em formato PNG com fundo transparente para melhor visualização no site (modo dark).
                            </p>
                        </div>

                        <Button type="submit" className="w-full">
                            Salvar Marca
                        </Button>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
