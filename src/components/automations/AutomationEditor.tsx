'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { WhatsappAutomation, updateAutomation } from '@/actions/automations';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AutomationEditorProps {
    automation: WhatsappAutomation | null;
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export function AutomationEditor({ automation, open, onClose, onSaved }: AutomationEditorProps) {
    const [message, setMessage] = useState('');
    const [delay, setDelay] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (automation) {
            setMessage(automation.message_template);
            setDelay(automation.delay_minutes);
            setIsActive(automation.is_active);
        }
    }, [automation]);

    const handleSave = async () => {
        if (!automation) return;

        setIsLoading(true);
        try {
            const res = await updateAutomation(automation.id, {
                message_template: message,
                delay_minutes: delay,
                is_active: isActive
            });

            if (res.success) {
                toast({ title: "Salvo", description: "Automação atualizada com sucesso." });
                onSaved();
                onClose();
            } else {
                toast({ title: "Erro", description: res.message || "Erro ao salvar.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Erro", description: "Erro inesperado.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const insertVariable = (variable: string) => {
        setMessage(prev => prev + ` {{${variable}}}`);
    };

    if (!automation) return null;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Editar: {automation.name}</SheetTitle>
                    <SheetDescription>
                        Personalize a mensagem e as regras de envio.
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-6 py-6">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="active-mode" className="text-base">Automação Ativa</Label>
                        <Switch id="active-mode" checked={isActive} onCheckedChange={setIsActive} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="delay">Atraso após evento (minutos)</Label>
                        <Input
                            id="delay"
                            type="number"
                            min="0"
                            value={delay}
                            onChange={(e) => setDelay(parseInt(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">0 = envio imediato.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Mensagem</Label>
                        <div className="flex gap-2 flex-wrap mb-2">
                            <Button variant="secondary" size="xs" onClick={() => insertVariable('customer_name')}>Nome</Button>
                            <Button variant="secondary" size="xs" onClick={() => insertVariable('order_id')}>Pedido #</Button>
                            <Button variant="secondary" size="xs" onClick={() => insertVariable('tracking_link')}>Rastreio</Button>
                            <Button variant="secondary" size="xs" onClick={() => insertVariable('checkout_url')}>Checkout</Button>
                        </div>
                        <Textarea
                            rows={10}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="font-mono text-sm resize-none"
                        />
                    </div>
                </div>

                <SheetFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
