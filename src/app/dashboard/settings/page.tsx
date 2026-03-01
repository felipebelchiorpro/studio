'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs
import { useToast } from '@/hooks/use-toast';
import { getIntegrationSettings, updateIntegrationSettings, testWebhook, testChatwootConnection } from '@/actions/settings';
import { Loader2, Save, CreditCard, Webhook, Store, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { OperatingHoursEditor } from '@/components/settings/OperatingHoursEditor';

export default function SettingsPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testingChatwoot, setTestingChatwoot] = useState(false);
    const [testPhone, setTestPhone] = useState('');

    // Integration State
    const [integrationData, setIntegrationData] = useState({
        mp_access_token: '',
        mp_public_key: '',
        webhook_order_created: '',
        status_order_created: false,
        status_abandoned_cart: false,
        auth_token: '',
        store_address: '',
        store_hours: '',
        chatwoot_url: '',
        chatwoot_account_id: '',
        chatwoot_token: '',
        chatwoot_inbox_id: ''
    });

    // Profile State
    const [profileData, setProfileData] = useState({
        name: '',
        email: ''
    });

    useEffect(() => {
        loadSettings();
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]); // Re-run when user loads

    const loadSettings = async () => {
        setLoading(true);
        const result = await getIntegrationSettings();
        if (result.success && result.data) {
            setIntegrationData({
                mp_access_token: result.data.mp_access_token || '',
                mp_public_key: result.data.mp_public_key || '',
                webhook_order_created: result.data.webhook_order_created || '',
                status_order_created: result.data.status_order_created || false,
                status_abandoned_cart: result.data.status_abandoned_cart || false,
                auth_token: result.data.auth_token || '',
                store_address: result.data.store_address || '',
                store_hours: result.data.store_hours || '',
                chatwoot_url: result.data.chatwoot_url || '',
                chatwoot_account_id: result.data.chatwoot_account_id || '',
                chatwoot_token: result.data.chatwoot_token || '',
                chatwoot_inbox_id: result.data.chatwoot_inbox_id || ''
            });
        }
        setLoading(false);
    };

    const handleIntegrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIntegrationData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveIntegrations = async () => {
        setSaving(true);
        const result = await updateIntegrationSettings(integrationData);

        if (result.success) {
            toast({ title: "Sucesso!", description: "Configurações atualizadas.", variant: 'default' });
        } else {
            toast({ title: "Erro", description: result.message, variant: 'destructive' });
        }
        setSaving(false);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { name: profileData.name }
            });

            if (error) throw error;

            toast({ title: "Perfil Atualizado", description: "Seu nome foi alterado com sucesso.", variant: 'default' });
            // Ideally force refresh auth context, but simplified for now
            window.location.reload(); // Simple way to refresh user context
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };
    const handleTestWebhook = async () => {
        setTesting(true);
        await updateIntegrationSettings(integrationData);
        const result = await testWebhook();
        if (result.success) {
            toast({ title: "Sucesso!", description: result.message, variant: 'default' });
        } else {
            toast({ title: "Falha no Teste", description: result.message, variant: 'destructive' });
        }
        setTesting(false);
    };

    const handleTestChatwoot = async () => {
        if (!testPhone) {
            toast({ title: "Atenção", description: "Digite um número de telefone para testar (ex: 5511999999999).", variant: 'destructive' });
            return;
        }
        setTestingChatwoot(true);
        const result = await testChatwootConnection(testPhone);
        if (result.success) {
            toast({ title: "Sucesso!", description: result.message, variant: 'default' });
        } else {
            toast({ title: "Falha no Teste", description: result.message, variant: 'destructive' });
        }
        setTestingChatwoot(false);
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
                <p className="text-muted-foreground">Gerencie seu perfil e as integrações da loja.</p>
            </div>

            <Separator />

            <Tabs defaultValue="integrations" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="integrations">Integrações</TabsTrigger>
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                </TabsList>

                <TabsContent value="integrations" className="space-y-4">
                    {/* Mercado Pago Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-blue-500" /> Mercado Pago
                            </CardTitle>
                            <CardDescription>Configure suas chaves de API para processar pagamentos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="mp_public_key">Public Key (Chave Pública / Frontend)</Label>
                                <Input
                                    id="mp_public_key"
                                    name="mp_public_key"
                                    value={integrationData.mp_public_key}
                                    onChange={handleIntegrationChange}
                                    placeholder="APP_USR-..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="mp_access_token">Access Token (Chave Privada / Backend) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="mp_access_token"
                                    name="mp_access_token"
                                    value={integrationData.mp_access_token}
                                    onChange={handleIntegrationChange}
                                    placeholder="APP_USR-..."
                                    type="password"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Webhook & Automation Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Webhook className="h-5 w-5 text-purple-500" /> Automação (n8n / Typebot)
                            </CardTitle>
                            <CardDescription>URLs para notificações de pedidos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="webhook_order_created">Webhook: Novo Pedido Criado</Label>
                                <Input
                                    id="webhook_order_created"
                                    name="webhook_order_created"
                                    value={integrationData.webhook_order_created}
                                    onChange={handleIntegrationChange}
                                    placeholder="https://seu-n8n.com/webhook/..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="auth_token">Token de Autenticação (Header)</Label>
                                <Input
                                    id="auth_token"
                                    name="auth_token"
                                    value={integrationData.auth_token}
                                    onChange={handleIntegrationChange}
                                    placeholder="Bearer ..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chatwoot Integration Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Webhook className="h-5 w-5 text-pink-500" /> Integração Chatwoot (WhatsApp)
                            </CardTitle>
                            <CardDescription>Configure sua conta do Chatwoot para envio de mensagens automáticas.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="chatwoot_url">URL da Instalação Chatwoot</Label>
                                <Input
                                    id="chatwoot_url"
                                    name="chatwoot_url"
                                    value={integrationData.chatwoot_url}
                                    onChange={handleIntegrationChange}
                                    placeholder="https://chatwoot.seu-dominio.com"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="chatwoot_account_id">ID da Conta</Label>
                                    <Input
                                        id="chatwoot_account_id"
                                        name="chatwoot_account_id"
                                        value={integrationData.chatwoot_account_id}
                                        onChange={handleIntegrationChange}
                                        placeholder="Ex: 1"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="chatwoot_inbox_id">ID da Inbox (WhatsApp)</Label>
                                    <Input
                                        id="chatwoot_inbox_id"
                                        name="chatwoot_inbox_id"
                                        value={integrationData.chatwoot_inbox_id}
                                        onChange={handleIntegrationChange}
                                        placeholder="Ex: 5"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="chatwoot_token">Token de Acesso (API Key)</Label>
                                <Input
                                    id="chatwoot_token"
                                    name="chatwoot_token"
                                    value={integrationData.chatwoot_token}
                                    onChange={handleIntegrationChange}
                                    placeholder="O token que fica nas configurações do seu perfil"
                                    type="password"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col items-start gap-4 border-t px-6 py-4">
                            <div className="flex w-full items-center gap-2">
                                <Input
                                    placeholder="Seu número (ex: 5511999999999)"
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    className="max-w-[250px]"
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleTestChatwoot}
                                    disabled={testingChatwoot}
                                    type="button"
                                >
                                    {testingChatwoot ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Webhook className="mr-2 h-4 w-4" />}
                                    Testar Envio Chatwoot
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Salve as configurações antes de testar.</p>
                        </CardFooter>
                    </Card>

                    {/* Store Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5 text-green-500" /> Configurações da Loja
                            </CardTitle>
                            <CardDescription>Endereço e horários para mensagens de retirada.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="store_address">Endereço da Loja (Para Retirada)</Label>
                                <Input
                                    id="store_address"
                                    name="store_address"
                                    value={integrationData.store_address}
                                    onChange={handleIntegrationChange}
                                    placeholder="Rua Exemplo, 123 - Centro, Caconde"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Horário de Funcionamento</Label>
                                <OperatingHoursEditor
                                    value={integrationData.store_hours}
                                    onChange={(val) => setIntegrationData(prev => ({ ...prev, store_hours: val }))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={handleTestWebhook} disabled={testing} type="button">
                            {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Webhook className="mr-2 h-4 w-4" />}
                            Testar Webhook
                        </Button>

                        <Button onClick={handleSaveIntegrations} disabled={saving} className="w-full sm:w-auto h-12 text-lg">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar Configurações
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" /> Meu Perfil
                            </CardTitle>
                            <CardDescription>Atualize suas informações pessoais.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleProfileChange}
                                    placeholder="Seu Nome"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={profileData.email}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
                            </div>
                            <Button onClick={handleSaveProfile} disabled={saving}>
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Salvar Perfil
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
