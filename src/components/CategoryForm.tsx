
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Category } from "@/types";

const categorySchema = z.object({
    name: z.string().min(2, {
        message: "O nome deve ter pelo menos 2 caracteres.",
    }),
    imageUrl: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
    parentId: z.string().optional(),
    type: z.enum(['supplement', 'clothing', 'other']).optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const DEFAULT_PLACEHOLDER_IMAGE = "https://placehold.co/400?text=Sem+Imagem";

interface CategoryFormProps {
    category?: Category | null;
    onSubmitCategory: (data: Category) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CategoryForm({ category, onSubmitCategory, open, onOpenChange }: CategoryFormProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [allCategories, setAllCategories] = useState<Category[]>([]);

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            imageUrl: "",
            parentId: "none", // Special value for no parent
            type: "supplement",
        },
    });

    useEffect(() => {
        // Fetch all categories for the parent dropdown
        const fetchCats = async () => {
            try {
                const { fetchCategoriesService } = await import('@/services/categoryService');
                const data = await fetchCategoriesService();
                setAllCategories(data);
            } catch (error) {
                console.error("Failed to load categories for select", error);
            }
        };
        if (open) {
            fetchCats();
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            if (category) {
                form.reset({
                    name: category.name,
                    imageUrl: category.imageUrl || "",
                    parentId: category.parentId || "none",
                    type: category.type || "supplement",
                });
                setImagePreview(category.imageUrl || DEFAULT_PLACEHOLDER_IMAGE);
            } else {
                form.reset({
                    name: "",
                    imageUrl: "",
                    parentId: "none",
                    type: "supplement",
                });
                setImagePreview(DEFAULT_PLACEHOLDER_IMAGE);
            }
        }
    }, [category, form, open]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUri = reader.result as string;
                setImagePreview(dataUri);
                form.setValue("imageUrl", dataUri); // Note: Should validate URL if schema enforces it, but dataUri is long string. Zod URL might fail on data URI? Let's relax schema or trust check.
                // Actually data URI is a valid URL for src but Zod .url() validates protocol http/https usually.
                // We might want to clear errors or change schema to allow string().
                form.clearErrors("imageUrl");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (data: CategoryFormValues) => {
        const finalData: Category = {
            id: category?.id || "", // ID handled by service/db
            name: data.name,
            imageUrl: imagePreview || undefined,
            parentId: data.parentId === "none" ? undefined : data.parentId,
            type: data.type || 'supplement',
        };
        onSubmitCategory(finalData);
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{category?.id ? "Editar Categoria" : "Nova Categoria"}</SheetTitle>
                    <SheetDescription>
                        {category?.id ? "Faça as alterações necessárias na categoria." : "Preencha os dados da nova categoria."}
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Categoria</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Suplementos" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="parentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria Mãe (Opcional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma categoria mãe" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">-- Nenhuma (Categoria Principal) --</SelectItem>
                                            {allCategories
                                                .filter(c => c.id !== category?.id) // Prevent self-parenting
                                                .map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col gap-4">
                            <FormLabel>Imagem da Categoria (URL ou Upload)</FormLabel>

                            <div className="flex justify-center bg-muted/30 p-4 rounded-md border border-dashed border-muted-foreground/25">
                                <div className="relative w-40 h-40">
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
                                                placeholder="https://exemplo.com/imagem.png"
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

                        <FormField
                            control={form.control}
                            name="type"
                            defaultValue="supplement"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Categoria</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-4">
                                            <label className="flex items-center space-x-2 cursor-pointer border p-2 rounded hover:bg-muted">
                                                <input
                                                    type="radio"
                                                    value="supplement"
                                                    checked={field.value === 'supplement'}
                                                    onChange={() => field.onChange('supplement')}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm font-medium">Suplemento</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer border p-2 rounded hover:bg-muted">
                                                <input
                                                    type="radio"
                                                    value="clothing"
                                                    checked={field.value === 'clothing'}
                                                    onChange={() => field.onChange('clothing')}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm font-medium">Vestuário</span>
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">
                            {category?.id ? "Salvar Alterações" : "Criar Categoria"}
                        </Button>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
