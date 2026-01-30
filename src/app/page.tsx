
import React, { Suspense } from 'react';
import { fetchNewReleasesService, fetchBestSellersService, fetchOnSaleService } from '@/services/productService';
import { fetchPromotionsService } from '@/services/promotionService';
import HomeClient from '@/components/home/HomeClient';
import { Skeleton } from '@/components/ui/skeleton';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  // Parallel fetching for even better performance with specialized queries
  const [newReleases, bestSellers, onSale, promotions] = await Promise.all([
    fetchNewReleasesService(8),
    fetchBestSellersService(8),
    fetchOnSaleService(8),
    fetchPromotionsService(),
  ]);

  return (
    <Suspense fallback={<HomeLoadingSkeleton />}>
      <HomeClient
        newReleases={newReleases}
        bestSellers={bestSellers}
        onSale={onSale}
        promotions={promotions}
      />
    </Suspense>
  );
}

function HomeLoadingSkeleton() {
  return (
    <div className="space-y-8 sm:space-y-12">
      <Skeleton className="h-[30vh] sm:h-[40vh] w-full rounded-lg" />
      <Skeleton className="h-12 sm:h-16 w-full" />
      {[...Array(4)].map((_, i) => (
        <section key={i}>
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <Skeleton className="h-7 sm:h-8 w-2/5 sm:w-1/3" />
            <Skeleton className="h-7 sm:h-8 w-20 sm:w-24" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-60 sm:h-72 w-full rounded-lg" />)}
          </div>
        </section>
      ))}
    </div>
  );
}



