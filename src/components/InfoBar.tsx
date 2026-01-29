"use client";

import React from 'react';
import { Truck, CreditCard, ShieldCheck, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, title, subtitle }) => {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/5 hover:border-red-500/30 transition-all duration-300 group">
      <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_0_10px_rgba(220,38,38,0.4)] group-hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] transition-shadow">
        {icon}
      </div>
      <div>
        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">{title}</h3>
        <p className="text-[10px] sm:text-xs text-gray-300">{subtitle}</p>
      </div>
    </div>
  );
};

export default function InfoBar() {
  const items = [
    {
      icon: <Truck className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: 'Entrega e Retirada',
      subtitle: 'Caconde e região',
    },
    {
      icon: <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: 'Pagamento Facilitado',
      subtitle: 'Em até 3x sem Juros',
    },
    {
      icon: <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: 'Sua Compra Segura',
      subtitle: 'Site 100% Protegido',
    },
    {
      icon: <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: 'Atendimento Exclusivo',
      subtitle: 'Suporte via WhatsApp',
    },
  ];

  return (
    <section className="bg-background py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item, index) => (
            <InfoItem
              key={index}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
