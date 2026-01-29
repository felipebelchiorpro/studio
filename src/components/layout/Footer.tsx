"use client";

import Link from 'next/link';
import { Github, Linkedin, Instagram, ShieldCheck } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-card text-card-foreground border-t border-border/40">
            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-1">
                        <h3 className="font-headline text-lg font-semibold text-primary mb-2">DarkStore Suplementos</h3>
                        <p className="text-sm text-muted-foreground">Sua jornada para o próximo nível começa aqui. Qualidade e performance em cada scoop.</p>
                    </div>
                    <div>
                        <h4 className="text-md font-semibold mb-3">Institucional</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">Sobre Nós</Link></li>
                            <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">Produtos</Link></li>
                            <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Fale Conosco</Link></li>
                            <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-md font-semibold mb-3">Ajuda</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">Perguntas Frequentes</Link></li>
                            <li><Link href="/shipping" className="text-muted-foreground hover:text-primary transition-colors">Fretes e Entregas</Link></li>
                            <li><Link href="/returns" className="text-muted-foreground hover:text-primary transition-colors">Trocas e Devoluções</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-md font-semibold mb-3">Redes Sociais</h4>
                        <div className="flex space-x-4">
                            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={24} /></a>
                            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={24} /></a>
                            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors"><Github size={24} /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border/40 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Formas de Pagamento */}
                    <div>
                        <h4 className="text-md font-semibold mb-4">Formas de pagamento</h4>
                        <div className="flex flex-wrap gap-2">
                            {/* Simulated Card Icons */}
                            <div className="h-8 w-12 bg-white rounded flex items-center justify-center border border-gray-200" title="Visa">
                                <span className="text-blue-800 font-bold text-[10px] italic">VISA</span>
                            </div>
                            <div className="h-8 w-12 bg-white rounded flex items-center justify-center border border-gray-200" title="Mastercard">
                                <span className="text-red-600 font-bold text-[10px] flex"><span className="w-3 h-3 bg-red-600 rounded-full opacity-80 -mr-1"></span><span className="w-3 h-3 bg-yellow-500 rounded-full opacity-80"></span></span>
                            </div>
                            <div className="h-8 w-12 bg-white rounded flex items-center justify-center border border-gray-200" title="Elo">
                                <span className="text-black font-bold text-[10px]">Elo</span>
                            </div>
                            <div className="h-8 w-12 bg-white rounded flex items-center justify-center border border-gray-200" title="Amex">
                                <span className="text-blue-500 font-bold text-[8px] tracking-tighter">AMEX</span>
                            </div>
                            <div className="h-8 w-12 bg-white rounded flex items-center justify-center border border-gray-200" title="Pix">
                                <span className="text-[#32BCAD] font-bold text-[10px]">Pix</span>
                            </div>
                        </div>
                    </div>

                    {/* Segurança */}
                    <div>
                        <h4 className="text-md font-semibold mb-4">Segurança</h4>
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-1 px-3 py-1 bg-white rounded border border-gray-200 shadow-sm">
                                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px] font-bold">✓</div>
                                <div className="flex flex-col leading-none">
                                    <span className="text-[8px] text-gray-500 font-bold uppercase">Opiniões</span>
                                    <span className="text-[8px] text-gray-800 font-bold uppercase">Verificadas</span>
                                </div>
                            </div>
                            <div className="px-2 py-1 bg-white rounded border border-gray-200 shadow-sm">
                                <span className="text-[12px] font-bold text-[#E31C79]">VTEX</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-gray-200 shadow-sm">
                                <ShieldCheck className="h-4 w-4 text-green-600" />
                                <div className="flex flex-col leading-none">
                                    <span className="text-[10px] font-bold text-gray-800">SITE PROTEGIDO</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-border/40 pt-6 text-center">
                    <p className="text-sm text-muted-foreground">&copy; {currentYear} DarkStore Suplementos. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
