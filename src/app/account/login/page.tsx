"use client";

import CustomerLoginForm from '@/components/CustomerLoginForm';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function LoginContent() {
  const { isCustomerAuthenticated, customerAuthLoading } = useCustomerAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!customerAuthLoading && isCustomerAuthenticated) {
      const redirectUrl = searchParams.get('redirect') || '/account/dashboard';
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

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-10rem)]"><p>Carregando...</p></div>}>
      <LoginContent />
    </Suspense>
  );
}
