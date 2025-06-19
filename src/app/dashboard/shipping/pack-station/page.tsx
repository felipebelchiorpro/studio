
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScanLine, PackageCheck, PackageX, PackageWarning, CheckCircle2, XCircle, AlertTriangle, ListChecks, Package, Image as ImageIcon } from "lucide-react";
import { mockPackingOrders } from '@/data/mockData'; 
import type { PackingOrder, PackingOrderItem } from '@/types';
import Image from "next/image";
import { Separator } from '@/components/ui/separator';

type FeedbackType = "success" | "error-item" | "error-quantity" | "info" | "order-loaded" | null;
interface FeedbackState {
  type: FeedbackType;
  message: string;
}

let audioCtx: AudioContext | null = null;

const playSound = (type: 'success' | 'error' | 'alert') => {
  if (typeof window !== 'undefined' && !audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); 

  switch (type) {
    case 'success':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(660, audioCtx.currentTime); 
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.2);
      break;
    case 'error':
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(160, audioCtx.currentTime); 
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.4);
      break;
    case 'alert':
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(330, audioCtx.currentTime); 
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
      break;
  }
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.5); 
};


export default function PackingStationPage() {
  const [orderBarcode, setOrderBarcode] = useState('');
  const [productBarcode, setProductBarcode] = useState('');
  const [currentOrder, setCurrentOrder] = useState<PackingOrder | null>(null);
  const [itemsToPack, setItemsToPack] = useState<PackingOrderItem[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>({ type: null, message: '' });
  const [visualFlash, setVisualFlash] = useState<FeedbackType>(null);

  const productScanInputRef = useRef<HTMLInputElement>(null);
  const orderScanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visualFlash) {
      const timer = setTimeout(() => setVisualFlash(null), 500); 
      return () => clearTimeout(timer);
    }
  }, [visualFlash]);
  
  useEffect(() => {
    orderScanInputRef.current?.focus();
  }, []);

  const resetStation = useCallback(() => {
    setCurrentOrder(null);
    setItemsToPack([]);
    setProductBarcode('');
    setFeedback({ type: 'info', message: 'Escaneie o código do pedido para começar.' });
    orderScanInputRef.current?.focus();
  }, []);

  useEffect(() => {
    resetStation(); 
  }, [resetStation]);


  const handleOrderScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orderBarcode.trim()) return;

    const foundOrder = mockPackingOrders.find(o => o.orderId === orderBarcode.trim());
    if (foundOrder) {
      setCurrentOrder(foundOrder);
      setItemsToPack(foundOrder.items.map(item => ({ ...item, packedQuantity: 0 })));
      setFeedback({ type: 'order-loaded', message: `Pedido ${foundOrder.orderId} carregado. Cliente: ${foundOrder.customerName || 'N/A'}. Escaneie os produtos.` });
      setVisualFlash('success');
      playSound('success');
      setOrderBarcode(''); 
      productScanInputRef.current?.focus();
    } else {
      setFeedback({ type: 'error-item', message: 'Pedido não encontrado.' });
      setVisualFlash('error-item');
      playSound('error');
      setOrderBarcode('');
      orderScanInputRef.current?.focus();
    }
  };
  
  const handleProductScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productBarcode.trim() || !currentOrder) return;

    const scannedBarcode = productBarcode.trim();
    let itemFound = false;

    const updatedItems = itemsToPack.map(item => {
      if (item.barcode === scannedBarcode) {
        itemFound = true;
        if (item.packedQuantity < item.expectedQuantity) {
          playSound('success');
          setVisualFlash('success');
          setFeedback({ type: 'success', message: `Item "${item.name}" escaneado com sucesso!` });
          return { ...item, packedQuantity: item.packedQuantity + 1 };
        } else {
          playSound('alert');
          setVisualFlash('error-quantity');
          setFeedback({ type: 'error-quantity', message: `Quantidade extra para "${item.name}". Esperado: ${item.expectedQuantity}.` });
          return item; 
        }
      }
      return item;
    });

    if (itemFound) {
      setItemsToPack(updatedItems);
    } else {
      playSound('error');
      setVisualFlash('error-item');
      setFeedback({ type: 'error-item', message: `PRODUTO INCORRETO! Código "${scannedBarcode}" não pertence a este pedido.` });
    }

    setProductBarcode(''); 
    productScanInputRef.current?.focus();
  };

  const allItemsPacked = currentOrder && itemsToPack.every(item => item.packedQuantity === item.expectedQuantity);

  let flashClass = '';
  if (visualFlash === 'success' || visualFlash === 'order-loaded') flashClass = 'flash-success';
  if (visualFlash === 'error-item') flashClass = 'flash-error-item';
  if (visualFlash === 'error-quantity') flashClass = 'flash-error-quantity';

  return (
    <div className={`p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 min-h-screen flex flex-col ${flashClass}`}>
      <style jsx global>{`
        .flash-success { animation: flash-success-anim 0.5s ease-out; }
        @keyframes flash-success-anim { 0%, 100% { background-color: transparent; } 50% { background-color: rgba(74, 222, 128, 0.3); } }
        .flash-error-item { animation: flash-error-item-anim 0.5s ease-out; }
        @keyframes flash-error-item-anim { 0%, 100% { background-color: transparent; } 50% { background-color: rgba(239, 68, 68, 0.4); } }
        .flash-error-quantity { animation: flash-error-quantity-anim 0.5s ease-out; }
        @keyframes flash-error-quantity-anim { 0%, 100% { background-color: transparent; } 50% { background-color: rgba(245, 158, 11, 0.3); } }
      `}</style>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl sm:text-2xl md:text-3xl text-primary flex items-center">
            <ScanLine className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8" /> Estação de Conferência
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Escaneie o pedido e, em seguida, os produtos.</CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleOrderScan} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 sm:gap-3">
        <div className="flex-grow">
          <label htmlFor="orderBarcode" className="block text-xs sm:text-sm font-medium text-foreground mb-1">Código do Pedido:</label>
          <Input
            id="orderBarcode"
            ref={orderScanInputRef}
            type="text"
            value={orderBarcode}
            onChange={(e) => setOrderBarcode(e.target.value)}
            placeholder="Escaneie o pedido..."
            className="text-base sm:text-lg h-10 sm:h-12"
            disabled={!!currentOrder}
          />
        </div>
        <Button type="submit" size="lg" className="h-10 sm:h-12 text-sm sm:text-base w-full sm:w-auto" disabled={!!currentOrder}>
          <Package className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Carregar Pedido
        </Button>
      </form>

      {feedback.type && (
        <Alert variant={
          feedback.type === 'success' || feedback.type === 'order-loaded' ? "default" :
          feedback.type === 'error-item' ? "destructive" :
          feedback.type === 'error-quantity' ? "default" : 
          "default"
        } className={`
          ${(feedback.type === 'success' || feedback.type === 'order-loaded') && 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'}
          ${feedback.type === 'error-item' && 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400'}
          ${feedback.type === 'error-quantity' && 'border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'}
        `}>
          {feedback.type === 'success' || feedback.type === 'order-loaded' ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" /> : 
           feedback.type === 'error-item' ? <XCircle className="h-4 w-4 sm:h-5 sm:w-5" /> :
           feedback.type === 'error-quantity' ? <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" /> : null}
          <AlertTitle className="text-sm sm:text-lg font-semibold">
            {feedback.type === 'success' ? 'Sucesso!' : 
             feedback.type === 'order-loaded' ? 'Pedido Carregado!' :
             feedback.type === 'error-item' ? 'Erro de Produto!' :
             feedback.type === 'error-quantity' ? 'Alerta de Quantidade!' : 'Informação'}
          </AlertTitle>
          <AlertDescription className="text-xs sm:text-base">{feedback.message}</AlertDescription>
        </Alert>
      )}
      
      {currentOrder && (
        <div className="flex-grow grid md:grid-cols-2 gap-4 sm:gap-6 mt-3 sm:mt-4 items-start">
          <Card className="h-full flex flex-col shadow-lg">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-lg sm:text-2xl flex items-center"><ListChecks className="mr-2 text-primary h-5 w-5 sm:h-6 sm:w-6"/>Itens a Conferir</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-2 sm:space-y-3 overflow-y-auto p-3 sm:p-4 text-sm sm:text-base max-h-[50vh] md:max-h-none">
              {itemsToPack.filter(item => item.packedQuantity < item.expectedQuantity).length === 0 && !allItemsPacked && (
                <p className="text-muted-foreground text-xs sm:text-sm">Nenhum item pendente.</p>
              )}
              {itemsToPack.filter(item => item.packedQuantity < item.expectedQuantity).map(item => (
                <div key={item.productId} className="flex items-center p-2 sm:p-3 border border-border/30 rounded-md gap-2 sm:gap-3 bg-card hover:bg-muted/30">
                  <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded bg-muted overflow-hidden flex-shrink-0">
                    <Image src={item.imageUrl || "https://placehold.co/100x100.png"} alt={item.name} layout="fill" objectFit="contain" data-ai-hint="product shipping"/>
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-foreground text-sm sm:text-lg leading-tight">{item.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">SKU: {item.sku || item.productId}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">BARCODE: {item.barcode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base sm:text-xl font-bold text-primary">
                      {item.packedQuantity} / {item.expectedQuantity}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Qtd.</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
            <form onSubmit={handleProductScan} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 sm:gap-3">
              <div className="flex-grow">
                <label htmlFor="productBarcode" className="block text-xs sm:text-sm font-medium text-foreground mb-1">Código do Produto:</label>
                <Input
                  id="productBarcode"
                  ref={productScanInputRef}
                  type="text"
                  value={productBarcode}
                  onChange={(e) => setProductBarcode(e.target.value)}
                  placeholder="Escaneie o produto..."
                  className="text-base sm:text-lg h-10 sm:h-12"
                  disabled={!currentOrder || allItemsPacked}
                />
              </div>
              <Button type="submit" size="lg" className="h-10 sm:h-12 text-sm sm:text-base bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto" disabled={!currentOrder || allItemsPacked}>
                <ScanLine className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5"/> Escanear
              </Button>
            </form>

            <Card className="flex-grow flex flex-col shadow-lg">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-2xl flex items-center"><PackageCheck className="mr-2 text-green-500 h-5 w-5 sm:h-6 sm:w-6"/>Itens Conferidos</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 sm:space-y-3 overflow-y-auto p-3 sm:p-4 text-sm sm:text-base max-h-[50vh] md:max-h-none">
                {itemsToPack.filter(item => item.packedQuantity > 0).length === 0 && (
                   <p className="text-muted-foreground text-xs sm:text-sm">Nenhum item conferido.</p>
                )}
                {itemsToPack.filter(item => item.packedQuantity > 0).map(item => (
                  <div key={item.productId + "-packed"} className={`flex items-center p-2 sm:p-3 border rounded-md gap-2 sm:gap-3 ${item.packedQuantity === item.expectedQuantity ? 'border-green-500 bg-green-500/10' : 'border-yellow-500 bg-yellow-500/10'}`}>
                     <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded bg-muted overflow-hidden flex-shrink-0">
                        <Image src={item.imageUrl || "https://placehold.co/100x100.png"} alt={item.name} layout="fill" objectFit="contain" data-ai-hint="product shipping"/>
                     </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-foreground text-sm sm:text-lg leading-tight">{item.name}</p>
                       <p className="text-[10px] sm:text-xs text-muted-foreground">SKU: {item.sku || item.productId}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-base sm:text-xl font-bold ${item.packedQuantity === item.expectedQuantity ? 'text-green-600' : 'text-yellow-600'}`}>
                        {item.packedQuantity} / {item.expectedQuantity}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Qtd.</p>
                    </div>
                     {item.packedQuantity === item.expectedQuantity && <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0"/>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {currentOrder && (
        <>
          <Separator className="my-4 sm:my-6"/>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-auto pt-3 sm:pt-4 gap-2 sm:gap-0">
            <Button variant="outline" size="lg" onClick={resetStation} className="text-sm sm:text-base w-full sm:w-auto">
              <XCircle className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5"/> Cancelar Pedido
            </Button>
            <Button 
              size="lg" 
              className="text-sm sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
              disabled={!allItemsPacked}
              onClick={() => { 
                playSound('success');
                setFeedback({type: 'success', message: 'Todos os itens conferidos! Pronto para gerar etiqueta (funcionalidade futura).'});
              }}
            >
             <PackageCheck className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5"/> Gerar Etiqueta (Simulado)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

