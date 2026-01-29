"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types";
import { useProduct } from "@/context/ProductContext"; // To fetch full product objects if needed, but we mostly store IDs

interface FavoritesContextType {
    favorites: string[];
    addToFavorites: (productId: string) => void;
    removeFromFavorites: (productId: string) => void;
    isFavorite: (productId: string) => boolean;
    toggleFavorite: (productId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Load from local storage on mount
        const storedFavorites = localStorage.getItem("darkstore-favorites");
        if (storedFavorites) {
            try {
                setFavorites(JSON.parse(storedFavorites));
            } catch (e) {
                console.error("Failed to parse favorites", e);
            }
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        // Save to local storage whenever favorites change
        if (loaded) {
            localStorage.setItem("darkstore-favorites", JSON.stringify(favorites));
        }
    }, [favorites, loaded]);

    const addToFavorites = (productId: string) => {
        setFavorites((prev) => {
            if (!prev.includes(productId)) {
                return [...prev, productId];
            }
            return prev;
        });
    };

    const removeFromFavorites = (productId: string) => {
        setFavorites((prev) => prev.filter((id) => id !== productId));
    };

    const isFavorite = (productId: string) => {
        return favorites.includes(productId);
    };

    const toggleFavorite = (productId: string) => {
        if (isFavorite(productId)) {
            removeFromFavorites(productId);
        } else {
            addToFavorites(productId);
        }
    };

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                addToFavorites,
                removeFromFavorites,
                isFavorite,
                toggleFavorite,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}
