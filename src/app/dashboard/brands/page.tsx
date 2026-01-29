"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBrand } from '@/context/BrandContext';
import { Tag, Plus, Trash2 } from 'lucide-react';
import BrandForm from '@/components/BrandForm';
import Image from 'next/image';

export default function ManageBrandsPage() {
  const { brands, addBrand, removeBrand } = useBrand();
  const [isBrandFormOpen, setIsBrandFormOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl font-bold text-foreground flex items-center">
          <Tag className="mr-3 h-8 w-8 text-primary" /> Gerenciar Marcas
        </h1>
        <Button onClick={() => setIsBrandFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Marca
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <Card key={brand.id} className="relative group overflow-hidden shadow-md hover:shadow-lg transition-shadow border-none bg-muted/10">
            <CardContent className="p-4 flex items-center justify-center aspect-square relative">
              <div className="relative w-full h-full">
                <Image
                  src={brand.imageUrl}
                  alt={brand.name}
                  layout="fill"
                  objectFit="contain"
                  className="p-2 brightness-200"
                />
              </div>
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-2 text-center backdrop-blur-sm">
                <p className="text-white text-xs font-semibold mb-2">{brand.name}</p>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeBrand(brand.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {brands.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-card">
            Nenhuma marca cadastrada no sistema.
          </div>
        )}
      </div>

      <BrandForm
        open={isBrandFormOpen}
        onOpenChange={setIsBrandFormOpen}
        onSubmitBrand={addBrand}
      />
    </div>
  );
}
