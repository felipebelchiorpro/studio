
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast"; // Assuming hook exists
import { fetchIntegrationSettingsService, updateIntegrationSettingsService } from "@/services/integrationService";
import { testWebhookAction } from "@/actions/integration";
import type { IntegrationSettings } from "@/types/integration";
import { Loader2, Send, Save, Webhook, MessageCircle } from "lucide-react";

export default function IntegrationsPage() {
    const [settings, setSettings] = useState<IntegrationSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTestingOrder, setIsTestingOrder] = useState(false);
    const [isTestingCart, setIsTestingCart] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const data = await fetchIntegrationSettingsService();
        if (data) {
            setSettings(data);
        } else {
            // Initialize empty if DB didn't return (should have seed, but handled gracefully)
            setSettings({
                id: '',
                webhook_order_created: '',
                webhook_abandoned_cart: '',
                status_order_created: false,
                status_abandoned_cart: false,
                auth_token: '',
                chatwoot_url: '',
                chatwoot_account_id: '',
                chatwoot_token: '',
                chatwoot_inbox_id: ''
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            await updateIntegrationSettingsService({
                webhook_order_created: settings.webhook_order_created,
                webhook_abandoned_cart: settings.webhook_abandoned_cart,
                status_order_created: settings.status_order_created,
                status_abandoned_cart: settings.status_abandoned_cart,
                auth_token: settings.auth_token,
                chatwoot_url: settings.chatwoot_url,
                chatwoot_account_id: settings.chatwoot_account_id,
                chatwoot_token: settings.chatwoot_token,
                chatwoot_inbox_id: settings.chatwoot_inbox_id
            });
            toast({ title: "Sucesso", description: "Configurações salvas!" });
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao salvar configurações.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTest = async (type: 'order_created' | 'abandoned_cart') => {
        const url = type === 'order_created' ? settings?.webhook_order_created : settings?.webhook_abandoned_cart;
        if (!url) {
            toast({ title: "Atenção", description: "Preencha a URL antes de testar.", variant: "destructive" });
            return;
        }

        if (type === 'order_created') setIsTestingOrder(true);
        else setIsTestingCart(true);

        const result = await testWebhookAction(url, type);

        if (type === 'order_created') setIsTestingOrder(false);
        else setIsTestingCart(false);

        toast({
            title: result.success ? "Sucesso no Teste" : "Falha no Teste",
            description: result.message,
            variant: result.success ? "default" : "destructive"
        });
    };

    if (loading) {
        return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Integrações de Marketing</h1>
                    <p className="text-muted-foreground">Automatize processos enviando eventos para o n8n ou outras ferramentas.</p>
                </div>
            </div>

            <Tabs defaultValue="webhooks" className="max-w-4xl">
                <TabsList>
                    <TabsTrigger value="webhooks" className="flex items-center gap-2"><Webhook className="h-4 w-4" /> Webhooks</TabsTrigger>
                    <TabsTrigger value="chatwoot" className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Chatwoot</TabsTrigger>
                </TabsList>

                <TabsContent value="webhooks" className="space-y-4 mt-4">

                    {/* Order Created Config */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Compra Finalizada (Order Created)</span>
                                <Switch
                                    checked={settings?.status_order_created}
                                    onCheckedChange={(c) => setSettings(s => s ? ({ ...s, status_order_created: c }) : null)}
                                />
                            </CardTitle>
                            <CardDescription>
                                Disparado assim que um novo pedido é salvo com sucesso.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full gap-2">
                                <Label htmlFor="webhookOrder">URL do Webhook (POST)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="webhookOrder"
                                        placeholder="https://n8n.seu-dominio.com/webhook/..."
                                        value={settings?.webhook_order_created || ''}
                                        onChange={(e) => setSettings(s => s ? ({ ...s, webhook_order_created: e.target.value }) : null)}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => handleTest('order_created')}
                                        disabled={isTestingOrder || !settings?.webhook_order_created}
                                    >
                                        {isTestingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                                        Testar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Abandoned Cart Config */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Carrinho Abandonado</span>
                                <Switch
                                    checked={settings?.status_abandoned_cart}
                                    onCheckedChange={(c) => setSettings(s => s ? ({ ...s, status_abandoned_cart: c }) : null)}
                                />
                            </CardTitle>
                            <CardDescription>
                                Disparado quando um carrinho completado não vira pedido após X tempo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full gap-2">
                                <Label htmlFor="webhookCart">URL do Webhook (POST)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="webhookCart"
                                        placeholder="https://n8n.seu-dominio.com/webhook/..."
                                        value={settings?.webhook_abandoned_cart || ''}
                                        onChange={(e) => setSettings(s => s ? ({ ...s, webhook_abandoned_cart: e.target.value }) : null)}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => handleTest('abandoned_cart')}
                                        disabled={isTestingCart || !settings?.webhook_abandoned_cart}
                                    >
                                        {isTestingCart ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                                        Testar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security (Token) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Segurança</CardTitle>
                            <CardDescription>Opcional: Token enviado no Header para validar a origem.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid w-full gap-2">
                                <Label htmlFor="authToken">Auth Token</Label>
                                <Input
                                    id="authToken"
                                    type="password"
                                    placeholder="Ex: secret_12345"
                                    value={settings?.auth_token || ''}
                                    onChange={(e) => setSettings(s => s ? ({ ...s, auth_token: e.target.value }) : null)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end pt-4">
                            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                </TabsContent>

                <TabsContent value="chatwoot" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuração do Chatwoot</CardTitle>
                            <CardDescription>
                                Conecte-se diretamente à API do seu Chatwoot para disparar mensagens do WhatsApp sem precisar de N8N.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full gap-2">
                                <Label htmlFor="chatwootUrl">URL da API (Sem barra no final)</Label>
                                <Input
                                    id="chatwootUrl"
                                    placeholder="https://chat.suaempresa.com.br"
                                    value={settings?.chatwoot_url || ''}
                                    onChange={(e) => setSettings(s => s ? ({ ...s, chatwoot_url: e.target.value }) : null)}
                                />
                            </div>
                            <div className="grid w-full gap-2">
                                <Label htmlFor="chatwootAccountId">Account ID</Label>
                                <Input
                                    id="chatwootAccountId"
                                    placeholder="Ex: 1"
                                    value={settings?.chatwoot_account_id || ''}
                                    onChange={(e) => setSettings(s => s ? ({ ...s, chatwoot_account_id: e.target.value }) : null)}
                                />
                            </div>
                            <div className="grid w-full gap-2">
                                <Label htmlFor="chatwootToken">API Access Token</Label>
                                <Input
                                    id="chatwootToken"
                                    type="password"
                                    placeholder="Copie o token das configurações de perfil"
                                    value={settings?.chatwoot_token || ''}
                                    onChange={(e) => setSettings(s => s ? ({ ...s, chatwoot_token: e.target.value }) : null)}
                                />
                            </div>
                            <div className="grid w-full gap-2">
                                <Label htmlFor="chatwootInboxId">Inbox ID (WhatsApp)</Label>
                                <Input
                                    id="chatwootInboxId"
                                    placeholder="ID da caixa de entrada configurada para envio"
                                    value={settings?.chatwoot_inbox_id || ''}
                                    onChange={(e) => setSettings(s => s ? ({ ...s, chatwoot_inbox_id: e.target.value }) : null)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end pt-4">
                            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
