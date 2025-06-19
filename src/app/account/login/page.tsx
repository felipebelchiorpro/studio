
"use client";

import CustomerLoginForm from '@/components/CustomerLoginForm'; // Changed to CustomerLoginForm
import { useCustomerAuth } from '@/context/CustomerAuthContext'; // Changed to useCustomerAuth
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function CustomerLoginPage() { // Renamed for clarity
  const { isCustomerAuthenticated, customerAuthLoading } = useCustomerAuth(); // Changed to useCustomerAuth
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!customerAuthLoading && isCustomerAuthenticated) {
      const redirectUrl = searchParams.get('redirect') || '/account/dashboard'; // Default redirect for customers
      router.replace(redirectUrl);
    }
  }, [isCustomerAuthenticated, customerAuthLoading, router, searchParams]);

  if (customerAuthLoading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]"><p>Carregando...</p></div>;
  }
  
  if (isCustomerAuthenticated) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]"><p>Redirecionando...</p></div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <CustomerLoginForm />
    </div>
  );
}
