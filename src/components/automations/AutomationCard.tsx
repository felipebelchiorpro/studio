'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Clock, MessageSquare, Settings } from 'lucide-react';
import { WhatsappAutomation } from '@/actions/automations';

interface AutomationCardProps {
    automation: WhatsappAutomation;
    onEdit: (automation: WhatsappAutomation) => void;
    onToggle: (id: string, currentStatus: boolean) => void;
}

export function AutomationCard({ automation, onEdit, onToggle }: AutomationCardProps) {
    return (
        <Card className={`transition-all hover:shadow-md ${!automation.is_active ? 'opacity-75 bg-muted/30' : ''}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant={automation.is_active ? "default" : "secondary"} className="mb-2">
                            {automation.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <CardTitle className="text-lg">{automation.name}</CardTitle>
                    </div>
                    <Switch
                        checked={automation.is_active}
                        onCheckedChange={() => onToggle(automation.id, automation.is_active)}
                    />
                </div>
                <CardDescription>{automation.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    <span>Atraso: {automation.delay_minutes} min</span>
                </div>
                <div className="bg-muted p-3 rounded-md text-xs font-mono truncate">
                    {automation.message_template}
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => onEdit(automation)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                </Button>
            </CardFooter>
        </Card>
    );
}
