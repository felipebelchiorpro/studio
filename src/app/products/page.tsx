
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import ProductFilters, { type Filters } from '@/components/ProductFilters';
import type { Product } from '@/types';
import { useSearchParams } from 'next/navigation';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProduct } from '@/context/ProductContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button'; // For mobile filter toggle
import { Filter as FilterIcon, X as XIcon } from 'lucide-react'; // For mobile filter toggle
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // For mobile filters


const ITEMS_PER_PAGE = 8; // Could be adjusted for mobile vs desktop if desired

function ProductsContent() {
  const { products: allProductsFromContext, loading: productsLoading } = useProduct();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSearchQuery = searchParams.get('q');

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [filters, setFilters] = useState<Filters>({
    categories: initialCategory ? [initialCategory] : [],
    priceRange: [0, 1000],
    brands: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('default');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);


  useEffect(() => {
    if (!productsLoading && allProductsFromContext.length > 0) {
      const maxPrice = Math.max(...allProductsFromContext.map(p => p.price), 100); // Ensure maxPrice is at least 100
      setFilters(prevFilters => ({
        ...prevFilters,
        // Keep existing categories/brands, update priceRange if it's still default or needs to expand
        priceRange: (prevFilters.priceRange[1] === 1000 && maxPrice > 1000) || prevFilters.priceRange[1] < maxPrice ? [prevFilters.priceRange[0], maxPrice] : prevFilters.priceRange
      }));
    }
  }, [productsLoading, allProductsFromContext]);

  useEffect(() => {
    if (productsLoading) return;

    let result = [...allProductsFromContext];

    if (searchQuery) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.categories.length > 0) {
      result = result.filter(product => filters.categories.includes(product.category));
    }
    if (filters.brands.length > 0) {
      result = result.filter(product => filters.brands.includes(product.brand));
    }
    result = result.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [searchQuery, filters, allProductsFromContext, sortOption, productsLoading]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    // Optionally close sheet if filters are applied from within a sheet
    // setIsFilterSheetOpen(false); 
  };


  if (productsLoading) {
    return (
      <div className="container mx-auto py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center">
          <Skeleton className="h-9 sm:h-10 w-3/5 sm:w-1/2 mx-auto mb-2" />
          <Skeleton className="h-5 sm:h-6 w-4/5 sm:w-3/4 mx-auto" />
        </div>
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <Skeleton className="h-80 sm:h-96 w-full rounded-lg" />
          </aside>
          <main className="w-full md:w-3/4 lg:w-4/5">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
              <Skeleton className="h-10 sm:h-12 w-full sm:w-1/2" />
              <Skeleton className="h-9 sm:h-10 w-32 sm:w-[180px]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              {[...Array(ITEMS_PER_PAGE)].map((_, i) => <Skeleton key={i} className="h-72 sm:h-80 w-full rounded-lg" />)}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-foreground">Nossos Produtos</h1>
        <p className="text-base sm:text-lg text-muted-foreground mt-2">Encontre os melhores suplementos.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
        {/* Desktop Filters */}
        <aside className="hidden md:block w-full md:w-1/4 lg:w-1/5">
          <ProductFilters
            onFilterChange={handleFilterChange}
          />
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div className="w-full sm:flex-grow">
              <SearchBar onSearch={setSearchQuery} initialQuery={searchQuery} />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Mobile Filter Trigger */}
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden flex-grow sm:flex-grow-0">
                    <FilterIcon className="mr-2 h-4 w-4" /> Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0">
                  <div className="p-4 h-full overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-headline text-lg text-primary">Filtrar Produtos</h3>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon"><XIcon className="h-5 w-5" /></Button>
                      </SheetTrigger>
                    </div>
                    <ProductFilters
                      onFilterChange={handleFilterChange}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">Ordenar por:</span>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-full sm:w-[170px] md:w-[180px] h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Padrão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default" className="text-xs sm:text-sm">Padrão</SelectItem>
                  <SelectItem value="price-asc" className="text-xs sm:text-sm">Menor Preço</SelectItem>
                  <SelectItem value="price-desc" className="text-xs sm:text-sm">Maior Preço</SelectItem>
                  <SelectItem value="name-asc" className="text-xs sm:text-sm">Nome (A-Z)</SelectItem>
                  <SelectItem value="name-desc" className="text-xs sm:text-sm">Nome (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              {paginatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12">
              <p className="text-lg sm:text-xl text-muted-foreground">Nenhum produto encontrado.</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Tente ajustar sua busca ou filtros.</p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-8 sm:mt-12">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>
                {/* Simplified pagination display for mobile, more numbers for desktop - basic example */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Basic logic to show fewer page numbers
                  if (totalPages <= 5 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                          isActive={currentPage === page}
                          aria-current={currentPage === page ? "page" : undefined}
                          className="text-xs sm:text-sm"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <PaginationEllipsis key={`ellipsis-${page}`} className="hidden sm:flex" />;
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center">
          <Skeleton className="h-9 sm:h-10 w-3/5 sm:w-1/2 mx-auto mb-2" />
          <Skeleton className="h-5 sm:h-6 w-4/5 sm:w-3/4 mx-auto" />
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
