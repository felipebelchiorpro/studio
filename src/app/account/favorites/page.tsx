"use client";

import { useFavorites } from "@/context/FavoritesContext";
import { useProduct } from "@/context/ProductContext";
import { useEffect, useState } from "react";
import { Product } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

export default function FavoritesPage() {
    const { favorites, toggleFavorite } = useFavorites();
    const { getProductById } = useProduct();
    const { addToCart } = useCart();
    const { toast } = useToast();
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Resolve all favorite IDs to Product objects
        const products = favorites
            .map((id) => getProductById(id))
            .filter((p): p is Product => p !== undefined && p !== null);
        setFavoriteProducts(products);
    }, [favorites, getProductById]);

    const handleAddToCart = (product: Product) => {
        addToCart(product, 1);
        toast({
            title: "Adicionado!",
            description: `${product.name} foi para o seu carrinho.`,
        });
    };

    if (favorites.length === 0) {
        return (
            <div className="container mx-auto py-16 px-4 text-center">
                <h1 className="text-3xl font-bold mb-4">Meus Favoritos</h1>
                <div className="flex flex-col items-center justify-center space-y-4 opacity-70 mt-10">
                    <Heart className="h-24 w-24 text-muted-foreground stroke-1" />
                    <p className="text-xl text-muted-foreground font-medium">Você ainda não tem favoritos.</p>
                    <p className="max-w-md text-muted-foreground">Navegue pela loja e clique no coração ❤️ nos produtos que você mais gostar para salvá-los aqui.</p>
                    <Button asChild className="mt-4">
                        <Link href="/products">Explorar Produtos</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/account/dashboard">
                    <Button variant="ghost" size="icon"><ArrowLeft /></Button>
                </Link>
                <h1 className="text-3xl font-bold">Meus Favoritos ({favorites.length})</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteProducts.map((product) => (
                    <div key={product.id} className="group relative bg-card border border-border/40 rounded-lg overflow-hidden flex flex-col hover:border-primary/50 transition-colors">

                        {/* Image Container */}
                        <div className="aspect-[3/4] relative bg-secondary/10">
                            <Link href={`/products/${product.id}`}>
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                />
                            </Link>

                            {/* Remove Button */}
                            <button
                                onClick={() => toggleFavorite(product.id)}
                                className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-background transition-colors"
                            >
                                <Heart className="h-5 w-5 fill-red-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-1">
                            <div className="flex-1">
                                <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
                                    <h3 className="font-bold line-clamp-2 mb-1">{product.name}</h3>
                                </Link>
                                <p className="text-sm text-muted-foreground mb-3">{product.brand}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-bold text-green-600">
                                        R$ {product.price.toFixed(2).replace('.', ',')}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-xs text-muted-foreground line-through">
                                            R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action */}
                            <div className="mt-4 pt-4 border-t border-border/40">
                                <Button
                                    onClick={() => handleAddToCart(product)}
                                    className="w-full gap-2"
                                    disabled={product.stock === 0}
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    {product.stock > 0 ? "Adicionar ao Carrinho" : "Indisponível"}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
