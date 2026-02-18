
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Address } from '@/types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { AddressForm } from './AddressForm';
import { removeAddressService } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';

interface AddressListProps {
    userId: string;
    addresses: Address[];
    onUpdate: () => void;
}

export function AddressList({ userId, addresses, onUpdate }: AddressListProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
    const { toast } = useToast();

    const handleAdd = () => {
        setEditingAddress(undefined);
        setIsEditing(true);
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setIsEditing(true);
    };

    const handleDelete = async (addressId: string) => {
        if (confirm('Tem certeza que deseja excluir este endereço?')) {
            try {
                await removeAddressService(userId, addressId);
                toast({ title: "Endereço removido!" });
                onUpdate();
            } catch (error) {
                toast({ title: "Erro ao remover", variant: "destructive" });
            }
        }
    };

    const handleSuccess = () => {
        setIsEditing(false);
        onUpdate();
    };

    if (isEditing) {
        return (
            <div className="space-y-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>← Voltar</Button>
                <AddressForm
                    userId={userId}
                    address={editingAddress}
                    onSuccess={handleSuccess}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Endereços Salvos</h3>
                <Button onClick={handleAdd} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Novo Endereço
                </Button>
            </div>

            {addresses.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum endereço cadastrado.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((addr) => (
                        <Card key={addr.id} className="relative">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium flex justify-between">
                                    {addr.alias}
                                </CardTitle>
                                <CardDescription>
                                    {addr.street}, {addr.number} {addr.complement && ` - ${addr.complement}`}
                                    <br />
                                    {addr.neighborhood} - {addr.city}/{addr.state}
                                    <br />
                                    CEP: {addr.zipCode}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0 flex gap-2 justify-end">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(addr)}>
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(addr.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
