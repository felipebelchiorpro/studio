'use client';

import { useEffect, useState } from 'react';
import { getAutomations, updateAutomation, WhatsappAutomation } from '@/actions/automations';
import { AutomationCard } from '@/components/automations/AutomationCard';
import { AutomationEditor } from '@/components/automations/AutomationEditor';
import { AutomationCanvas } from '@/components/automations/AutomationCanvas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AutomationsPage() {
    const [automations, setAutomations] = useState<WhatsappAutomation[]>([]);
    const [selectedAutomation, setSelectedAutomation] = useState<WhatsappAutomation | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchAutomations = async () => {
        setIsLoading(true);
        const data = await getAutomations();
        setAutomations(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAutomations();
    }, []);

    const [viewMode, setViewMode] = useState<'grid' | 'canvas'>('grid');

    const handleEdit = (automation: WhatsappAutomation) => {
        setSelectedAutomation(automation);
        setIsEditorOpen(true);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setAutomations(prev => prev.map(a =>
            a.id === id ? { ...a, is_active: !currentStatus } : a
        ));

        const res = await updateAutomation(id, { is_active: !currentStatus });
        if (!res.success) {
            // Revert on failure
            setAutomations(prev => prev.map(a =>
                a.id === id ? { ...a, is_active: currentStatus } : a
            ));
            toast({ title: "Erro", description: "Falha ao atualizar status.", variant: "destructive" });
        } else {
            toast({ title: "Atualizado", description: `Automação ${!currentStatus ? 'ativada' : 'desativada'}.` });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Automação WhatsApp (Canvas)</h2>
                    <p className="text-muted-foreground">Gerencie as mensagens automáticas enviadas aos clientes.</p>
                </div>
                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                    >
                        Cards
                    </Button>
                    <Button
                        variant={viewMode === 'canvas' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('canvas')}
                    >
                        Fluxo (Canvas)
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {automations.map(automation => (
                                <AutomationCard
                                    key={automation.id}
                                    automation={automation}
                                    onEdit={handleEdit}
                                    onToggle={handleToggle}
                                />
                            ))}
                        </div>
                    ) : (
                        <AutomationCanvas
                            automations={automations}
                            onEdit={handleEdit}
                        />
                    )}
                </>
            )}

            <AutomationEditor
                automation={selectedAutomation}
                open={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSaved={fetchAutomations}
            />
        </div>
    );
}
