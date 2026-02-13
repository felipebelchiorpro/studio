"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import type { Product } from "@/types";
import { useBrand } from "@/context/BrandContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2, Plus, Upload, Image as ImageIcon, X } from "lucide-react";
import { uploadFile } from "@/services/storageService";
import { useToast } from "@/hooks/use-toast";

// Updated Schema with Pro Features
const productSchema = z.object({
    name: z.string().min(3, { message: "Nome do produto deve ter pelo menos 3 caracteres." }),
    description: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres." }),
    price: z.coerce.number().positive({ message: "Preço de venda deve ser um número positivo." }),
    originalPrice: z.coerce.number().positive({ message: "Preço original deve ser um número positivo." }).optional().nullable(),
    category: z.string().min(1, { message: "Selecione uma categoria." }),
    brand: z.string().min(1, { message: "Selecione uma marca." }),
    imageUrl: z.string().min(1, { message: "Imagem de capa é obrigatória." }),
    stock: z.coerce.number().int().min(0, { message: "Estoque não pode ser negativo." }),
    isNewRelease: z.boolean().optional(),

    // Variations
    sizes: z.array(z.string()).optional(),
    flavors: z.array(z.string()).optional(),

    // Pro Features
    weights: z.array(z.string()).optional(),
    gallery: z.array(z.string()).optional(),
    hoverImageUrl: z.string().optional(),
    colorMapping: z.array(z.object({
        color: z.string().min(1, "Nome da cor obrigatório"),
        hex: z.string().min(1, "Hex da cor obrigatório"),
        image: z.string().optional(),
        images: z.array(z.string()).optional() // Added Multi-Image
    })).optional(),
    flavorMapping: z.array(z.object({
        flavor: z.string().min(1, "Nome do sabor obrigatório"),
        image: z.string().optional()
    })).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
    product?: Product | null;
    onSubmitProduct: (data: Product, isEditing: boolean) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DEFAULT_PLACEHOLDER_IMAGE = "https://placehold.co/600x400.png";
const AVAILABLE_SIZES = ["PP", "P", "M", "G", "GG", "3G", "4G"];
const AVAILABLE_WEIGHTS = ["150g", "300g", "450g", "900g", "1kg", "1.8kg", "2kg", "3kg", "5kg"];

const PRODUCT_TYPES = [
    { id: 'clothing', name: 'Vestuário (Tamanho/Cor)' },
    { id: 'supplement', name: 'Suplemento (Sabor/Peso)' },
    { id: 'other', name: 'Outro (Sem variações)' }
];

export default function ProductForm({ product, onSubmitProduct, open, onOpenChange }: ProductFormProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [hoverImagePreview, setHoverImagePreview] = useState<string | null>(null);
    const { getBrands } = useBrand();
    const availableBrands = getBrands();
    const [categories, setCategories] = useState<any[]>([]);
    const [productType, setProductType] = useState<string>('other');
    const [flavorsInput, setFlavorsInput] = useState<string>("");
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        import('@/services/categoryService').then(({ fetchCategoriesService }) => {
            fetchCategoriesService().then(data => setCategories(data)).catch(console.error);
        });
    }, []);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            originalPrice: null,
            category: "",
            brand: "",
            imageUrl: DEFAULT_PLACEHOLDER_IMAGE,
            stock: 0,
            isNewRelease: false,
            sizes: [],
            flavors: [],
            weights: [],
            gallery: [],
            hoverImageUrl: "",
            colorMapping: [],
            flavorMapping: [],
        },
    });

    const { watch, setValue } = form;
    const gallery = watch("gallery") || [];
    const colorMapping = watch("colorMapping") || [];
    const flavorMapping = watch("flavorMapping") || [];

    useEffect(() => {
        if (open) {
            if (product) {
                form.reset({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    originalPrice: product.originalPrice || null,
                    category: product.categoryId || "",
                    brand: product.brand,
                    imageUrl: product.imageUrl || DEFAULT_PLACEHOLDER_IMAGE,
                    stock: product.stock,
                    isNewRelease: product.isNewRelease || false,
                    sizes: product.sizes || [],
                    flavors: product.flavors || [],
                    weights: product.weights || [],
                    gallery: product.gallery || [],
                    hoverImageUrl: product.hoverImageUrl || "",
                    colorMapping: product.colorMapping || [],
                    flavorMapping: product.flavorMapping || [],
                });

                // Determine type based on features present
                if ((product.sizes && product.sizes.length > 0) || (product.colorMapping && product.colorMapping.length > 0)) {
                    setProductType('clothing');
                } else if ((product.flavors && product.flavors.length > 0) || (product.weights && product.weights.length > 0)) {
                    setProductType('supplement');
                    // Ensure flavor input is populated if usage of mapping not detected or fallback
                    if (!product.flavorMapping || product.flavorMapping.length === 0) {
                        setFlavorsInput(product.flavors?.join(', ') || "");
                    }
                } else {
                    setProductType('other');
                }

                setImagePreview(product.imageUrl || DEFAULT_PLACEHOLDER_IMAGE);
                setHoverImagePreview(product.hoverImageUrl || null);
            } else {
                form.reset({
                    name: "",
                    description: "",
                    price: 0,
                    originalPrice: null,
                    category: "",
                    brand: "",
                    imageUrl: DEFAULT_PLACEHOLDER_IMAGE,
                    stock: 0,
                    isNewRelease: false,
                    sizes: [],
                    flavors: [],
                    weights: [],
                    gallery: [],
                    hoverImageUrl: "",
                    colorMapping: [],
                    flavorMapping: [],
                });
                setProductType('other');
                setFlavorsInput("");
                setImagePreview(DEFAULT_PLACEHOLDER_IMAGE);
                setHoverImagePreview(null);
            }
        }
    }, [product, form, open]);

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setUploading(true);
                const publicUrl = await uploadFile(file, 'products', 'covers');
                setImagePreview(publicUrl);
                setValue("imageUrl", publicUrl, { shouldValidate: true });
                toast({ title: "Sucesso", description: "Imagem de capa enviada com sucesso." });
            } catch (error) {
                console.error("Erro ao enviar imagem", error);
                toast({ title: "Erro", description: "Falha ao enviar imagem.", variant: "destructive" });
            } finally {
                setUploading(false);
            }
        }
    };

    const handleHoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setUploading(true);
                const publicUrl = await uploadFile(file, 'products', 'hovers');
                setHoverImagePreview(publicUrl);
                setValue("hoverImageUrl", publicUrl);
                toast({ title: "Sucesso", description: "Imagem hover enviada com sucesso." });
            } catch (error) {
                console.error("Erro ao enviar imagem", error);
                toast({ title: "Erro", description: "Falha ao enviar imagem.", variant: "destructive" });
            } finally {
                setUploading(false);
            }
        }
    };

    const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            try {
                setUploading(true);
                const uploadPromises = Array.from(files).map(file => uploadFile(file, 'products', 'gallery'));
                const newImages = await Promise.all(uploadPromises);
                setValue("gallery", [...gallery, ...newImages]);
                toast({ title: "Sucesso", description: `${newImages.length} imagens adicionadas à galeria.` });
            } catch (error) {
                console.error("Erro ao enviar imagens da galeria", error);
                toast({ title: "Erro", description: "Falha ao enviar algumas imagens.", variant: "destructive" });
            } finally {
                setUploading(false);
            }
        }
    };

    const removeGalleryImage = (index: number) => {
        const newGallery = [...gallery];
        newGallery.splice(index, 1);
        setValue("gallery", newGallery);
    };

    // Color Mapping Logic
    const addColor = () => {
        setValue("colorMapping", [...colorMapping, { color: "Nova Cor", hex: "#000000", image: "", images: [] }]);
    };

    const removeColor = (index: number) => {
        const newMapping = [...colorMapping];
        newMapping.splice(index, 1);
        setValue("colorMapping", newMapping);
    };

    const updateColor = (index: number, field: keyof typeof colorMapping[0], value: any) => {
        const newMapping = [...colorMapping];
        newMapping[index] = { ...newMapping[index], [field]: value };
        setValue("colorMapping", newMapping);
    };

    const handleColorImageUpload = async (index: number, files: FileList | null) => {
        if (files && files.length > 0) {
            try {
                setUploading(true);
                // Upload all selected files
                const uploadPromises = Array.from(files).map(file => uploadFile(file, 'products', 'colors'));
                const uploadedUrls = await Promise.all(uploadPromises);

                // Get current images or init empty
                const currentImages = colorMapping[index].images || [];
                const newImages = [...currentImages, ...uploadedUrls];

                // Update both 'images' (all) and 'image' (first one for legacy/main)
                updateColor(index, 'images', newImages);
                if (!colorMapping[index].image && newImages.length > 0) {
                    updateColor(index, 'image', newImages[0]);
                } else if (uploadedUrls.length > 0 && !colorMapping[index].image) {
                    updateColor(index, 'image', uploadedUrls[0]); // Fallback
                }

                toast({ title: "Sucesso", description: `${uploadedUrls.length} foto(s) da cor enviada(s).` });
            } catch (error) {
                console.error("Erro ao enviar imagem da cor", error);
                toast({ title: "Erro", description: "Falha ao enviar imagem.", variant: "destructive" });
            } finally {
                setUploading(false);
            }
        }
    };

    const removeColorImage = (colorIndex: number, imgIndex: number) => {
        const newMapping = [...colorMapping];
        const colorItem = newMapping[colorIndex];
        if (colorItem.images) {
            const newImages = [...colorItem.images];
            newImages.splice(imgIndex, 1);
            colorItem.images = newImages;
            // Update main image if needed
            if (colorItem.image && !newImages.includes(colorItem.image)) {
                colorItem.image = newImages.length > 0 ? newImages[0] : "";
            } else if (!colorItem.image && newImages.length > 0) {
                colorItem.image = newImages[0];
            }
            if (newImages.length === 0) colorItem.image = "";
        }
        setValue("colorMapping", newMapping);
    };

    // Flavor Mapping Logic
    const addFlavor = () => {
        setValue("flavorMapping", [...flavorMapping, { flavor: "Novo Sabor", image: "" }]);
    };

    const removeFlavor = (index: number) => {
        const newMapping = [...flavorMapping];
        newMapping.splice(index, 1);
        setValue("flavorMapping", newMapping);
    };

    const updateFlavor = (index: number, field: keyof typeof flavorMapping[0], value: string) => {
        const newMapping = [...flavorMapping];
        newMapping[index] = { ...newMapping[index], [field]: value };
        setValue("flavorMapping", newMapping);
    };

    const handleFlavorImageUpload = async (index: number, files: FileList | null) => {
        if (files && files[0]) {
            try {
                setUploading(true);
                const publicUrl = await uploadFile(files[0], 'products', 'flavors'); // Ensure 'flavors' bucket exists or use generic
                updateFlavor(index, 'image', publicUrl);
                toast({ title: "Sucesso", description: "Imagem do sabor enviada com sucesso." });
            } catch (error) {
                console.error("Erro ao enviar imagem do sabor", error);
                toast({ title: "Erro", description: "Falha ao enviar imagem.", variant: "destructive" });
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = (data: ProductFormValues) => {
        const selectedCategory = categories.find(c => c.id === data.category);
        const categoryName = selectedCategory ? selectedCategory.name : "Categoria Indefinida";

        // Backward compatibility for colors array (legacy)
        const refinedColors = data.colorMapping?.map(c => c.color) || [];

        // Backward compatibility for flavor array
        const refinedFlavors = data.flavorMapping?.map(f => f.flavor) || (productType === 'supplement' ? flavorsInput.split(',').map(s => s.trim()).filter(Boolean) : []);

        const finalData: Product = {
            ...data,
            id: product?.id || `prod-${Date.now()}`,
            imageUrl: data.imageUrl,
            hoverImageUrl: data.hoverImageUrl || undefined,
            originalPrice: data.originalPrice || undefined,
            isNewRelease: data.isNewRelease || false,
            categoryId: data.category,
            category: categoryName,
            sizes: productType === 'clothing' ? data.sizes : [],
            colors: refinedColors, // Maintain legacy array for search/filter if needed
            weights: productType === 'supplement' ? data.weights : [],
            flavors: refinedFlavors, // Use refined flavors which prioritizes mapping
            flavorMapping: data.flavorMapping, // New field persistence
            gallery: data.gallery,
            colorMapping: data.colorMapping,
        };
        onSubmitProduct(finalData, !!product);
        onOpenChange(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[800px] bg-card text-card-foreground max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl text-primary">
                            {product ? "Editar Produto" : "Adicionar Novo Produto"}
                        </DialogTitle>
                        <DialogDescription>
                            Configure todos os detalhes do produto, incluindo galeria e variações.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">

                        {/* --- SEÇÃO 1: BÁSICO --- */}
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome do Produto</Label>
                                    <Input id="name" {...form.register("name")} className={form.formState.errors.name ? "border-destructive" : ""} />
                                    {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Estoque Total</Label>
                                    <Input id="stock" type="number" {...form.register("stock")} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea id="description" {...form.register("description")} className={form.formState.errors.description ? "border-destructive h-24" : "h-24"} />
                                {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="originalPrice">Preço Original (R$)</Label>
                                    <Input id="originalPrice" type="number" step="0.01" {...form.register("originalPrice")} placeholder="Opcional" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Preço Venda (R$)</Label>
                                    <Input id="price" type="number" step="0.01" {...form.register("price")} className={form.formState.errors.price ? "border-destructive" : ""} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Categoria</Label>
                                    <Controller
                                        name="category"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Marca</Label>
                                    <Controller
                                        name="brand"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                                <SelectContent>
                                                    {availableBrands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* --- SEÇÃO 2: MÍDIA (Capa & Galeria) --- */}
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><ImageIcon size={20} /> Mídia</h3>

                            <div className="grid grid-cols-4 gap-4">
                                {/* Capa */}
                                <div className="col-span-1 space-y-2">
                                    <Label>Foto de Capa</Label>
                                    <div className="relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition bg-background overflow-hidden group">
                                        <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        {imagePreview ? (
                                            <Image src={imagePreview} alt="Capa" layout="fill" objectFit="cover" />
                                        ) : (
                                            <div className="text-center p-2">
                                                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                                <span className="text-xs text-muted-foreground">{uploading ? 'Aguarde...' : 'Capa'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Hover Image */}
                                <div className="col-span-1 space-y-2">
                                    <Label>Hover (Opcional)</Label>
                                    <div className="relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition bg-background overflow-hidden group">
                                        <input type="file" accept="image/*" onChange={handleHoverImageChange} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        {hoverImagePreview ? (
                                            <Image src={hoverImagePreview} alt="Hover" layout="fill" objectFit="cover" />
                                        ) : (
                                            <div className="text-center p-2">
                                                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                                <span className="text-xs text-muted-foreground">{uploading ? 'Aguarde...' : 'Hover'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Galeria */}
                                <div className="col-span-2 space-y-2">
                                    <Label>Galeria de Imagens</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {gallery.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-md overflow-hidden border bg-background group">
                                                <Image src={img} alt={`Gallery ${idx}`} layout="fill" objectFit="cover" />
                                                <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="relative aspect-square border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/50 transition">
                                            <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                            <Plus className="text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- SEÇÃO 3: VARIAÇÕES --- */}
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Configuração de Variação</h3>
                                <Select value={productType} onValueChange={(val) => setProductType(val)}>
                                    <SelectTrigger className="w-[200px] h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRODUCT_TYPES.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* VESTUÁRIO: Cores e Tamanhos */}
                            {productType === 'clothing' && (
                                <div className="space-y-6 pt-2">
                                    {/* Tamanhos */}
                                    <div className="space-y-3">
                                        <Label>Tamanhos Disponíveis</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_SIZES.map((size) => (
                                                <Controller
                                                    key={size}
                                                    name="sizes"
                                                    control={form.control}
                                                    render={({ field }) => {
                                                        const isChecked = field.value?.includes(size);
                                                        return (
                                                            <div
                                                                onClick={() => isChecked ? field.onChange(field.value?.filter(s => s !== size)) : field.onChange([...(field.value || []), size])}
                                                                className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer border transition-all ${isChecked ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:border-primary'
                                                                    }`}
                                                            >
                                                                {size}
                                                            </div>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cores & Mapping */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Cores & Fotos</Label>
                                            <Button type="button" variant="secondary" size="sm" onClick={addColor}><Plus size={14} className="mr-1" /> Adicionar Cor</Button>
                                        </div>

                                        <div className="space-y-2">
                                            {colorMapping.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhuma variação de cor adicionada.</p>}
                                            {colorMapping.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 p-2 border rounded-md bg-background">
                                                    <div className="w-8 h-8 rounded-full border shadow-sm cursor-pointer overflow-hidden relative">
                                                        <Input
                                                            type="color"
                                                            value={item.hex}
                                                            onChange={(e) => updateColor(idx, 'hex', e.target.value)}
                                                            className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 p-0 cursor-pointer border-none"
                                                        />
                                                    </div>
                                                    <Input
                                                        placeholder="Nome (ex: Azul Marinho)"
                                                        value={item.color}
                                                        onChange={(e) => updateColor(idx, 'color', e.target.value)}
                                                        className="h-8 flex-1"
                                                    />
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {(item.images?.length ? item.images : (item.image ? [item.image] : [])).map((imgUrl, imgIdx) => (
                                                            <div key={imgIdx} className="relative w-8 h-8 rounded-md bg-muted flex items-center justify-center overflow-hidden border group">
                                                                <Image src={imgUrl} alt={`${item.color} ${imgIdx}`} layout="fill" objectFit="cover" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeColorImage(idx, imgIdx)}
                                                                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        ))}

                                                        <div className="relative w-8 h-8 rounded-md bg-muted flex items-center justify-center overflow-hidden border cursor-pointer hover:opacity-80">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                multiple
                                                                disabled={uploading}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                onChange={(e) => handleColorImageUpload(idx, e.target.files)}
                                                            />
                                                            <Plus size={14} className="text-muted-foreground" />
                                                        </div>

                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 ml-2" onClick={() => removeColor(idx)}>
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUPLEMENTO: Sabores e Pesos */}
                            {productType === 'supplement' && (
                                <div className="space-y-6 pt-2">
                                    {/* Sabores */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Sabores & Fotos</Label>
                                            <Button type="button" variant="secondary" size="sm" onClick={addFlavor}><Plus size={14} className="mr-1" /> Adicionar Sabor</Button>
                                        </div>

                                        {/* Simple Input Backup if no mapping */}
                                        {flavorMapping.length === 0 && (
                                            <div className="mb-4">
                                                <Label className="text-xs text-muted-foreground">Ou digite lista simples (sem fotos):</Label>
                                                <Input
                                                    placeholder="Chocolate, Baunilha..."
                                                    value={flavorsInput}
                                                    onChange={(e) => setFlavorsInput(e.target.value)}
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            {flavorMapping.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 p-2 border rounded-md bg-background">
                                                    <Input
                                                        placeholder="Nome (ex: Chocolate Belga)"
                                                        value={item.flavor}
                                                        onChange={(e) => updateFlavor(idx, 'flavor', e.target.value)}
                                                        className="h-8 flex-1"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative w-8 h-8 rounded-md bg-muted flex items-center justify-center overflow-hidden border cursor-pointer hover:opacity-80">
                                                            <input type="file" accept="image/*" disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => handleFlavorImageUpload(idx, e.target.files)} />
                                                            {item.image ? (
                                                                <Image src={item.image} alt={item.flavor} layout="fill" objectFit="cover" />
                                                            ) : <Upload size={14} className="text-muted-foreground" />}
                                                        </div>
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeFlavor(idx)}>
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pesos */}
                                    <div className="space-y-3">
                                        <Label>Opções de Peso</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_WEIGHTS.map((weight) => (
                                                <Controller
                                                    key={weight}
                                                    name="weights"
                                                    control={form.control}
                                                    render={({ field }) => {
                                                        const isChecked = field.value?.includes(weight);
                                                        return (
                                                            <div
                                                                onClick={() => isChecked ? field.onChange(field.value?.filter(s => s !== weight)) : field.onChange([...(field.value || []), weight])}
                                                                className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer border transition-all ${isChecked ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:border-primary'
                                                                    }`}
                                                            >
                                                                {weight}
                                                            </div>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 pt-4 border-t">
                                <h4 className="font-semibold text-sm">Tags e Visibilidade</h4>
                                <div className="flex flex-wrap gap-6">
                                    <div className="flex items-center">
                                        <Controller
                                            name="isNewRelease"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    id="isNewRelease"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="mr-2"
                                                />
                                            )}
                                        />
                                        <Label htmlFor="isNewRelease" className="font-normal cursor-pointer">Novo Lançamento</Label>
                                    </div>

                                    <div className="flex items-center">
                                        <Checkbox
                                            id="isOutlet"
                                            checked={!!form.watch("originalPrice") && (form.watch("originalPrice") || 0) > form.watch("price")}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    // Auto-suggest a higher original price + 20% if not set
                                                    const currentPrice = form.getValues("price");
                                                    if (!form.getValues("originalPrice") || form.getValues("originalPrice")! <= currentPrice) {
                                                        setValue("originalPrice", Number((currentPrice * 1.2).toFixed(2)));
                                                    }
                                                } else {
                                                    setValue("originalPrice", null);
                                                }
                                            }}
                                            className="mr-2"
                                        />
                                        <Label htmlFor="isOutlet" className="font-normal cursor-pointer">Outlet (Oferta)</Label>
                                    </div>

                                    <div className="flex items-center">
                                        <Checkbox
                                            id="isKit"
                                            checked={categories.find(c => c.id === form.watch("category"))?.name?.toLowerCase().includes("kit")}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    const kitCategory = categories.find(c => c.name.toLowerCase().includes("kit") || c.name.toLowerCase().includes("kits"));
                                                    if (kitCategory) {
                                                        setValue("category", kitCategory.id);
                                                    } else {
                                                        // Fallback if no category named Kit exists yet (should create one ideally)
                                                        alert("Categoria 'Kits' não encontrada. Crie-a primeiro.");
                                                    }
                                                }
                                            }}
                                            className="mr-2"
                                        />
                                        <Label htmlFor="isKit" className="font-normal cursor-pointer">É um Kit?</Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="button" onClick={form.handleSubmit(handleSubmit)} disabled={form.formState.isSubmitting || uploading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            {form.formState.isSubmitting || uploading ? "Salvando..." : "Salvar Produto"}
                        </Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>
        </>
    );
}

