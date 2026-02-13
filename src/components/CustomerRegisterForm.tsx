"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { pb } from "@/lib/pocketbase";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(10, "Telefone inválido (inclua DDD)"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function CustomerRegisterForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setLoading(true);
        try {
            // 1. Create User
            // We omit 'username' to let PocketBase auto-generate it.
            // PocketBase expects: email, password, passwordConfirm, emailVisibility, name, phone.
            const payload = {
                email: data.email,
                emailVisibility: true,
                password: data.password,
                passwordConfirm: data.confirmPassword,
                name: data.name,
                phone: data.phone,
            };

            await pb.collection('users').create(payload);

            // 2. Auto Login
            await pb.collection('users').authWithPassword(data.email, data.password);

            toast({
                title: "Cadastro realizado!",
                description: "Bem-vindo à DarkStore!",
                className: "bg-green-600 text-white"
            });

            // 3. Redirect
            router.push('/');

        } catch (error: any) {
            console.error("Registration error details:", error.data);

            // Extract specific validation error if available
            let errorMsg = "Erro ao criar conta. Verifique os dados.";

            if (error.data?.data) {
                const fields = error.data.data;
                const fieldErrors = Object.entries(fields)
                    .map(([key, value]: [string, any]) => {
                        const fieldName = key === 'email' ? 'Email' :
                            key === 'password' ? 'Senha' :
                                key === 'passwordConfirm' ? 'Confirmação de Senha' :
                                    key === 'phone' ? 'Telefone' : key;
                        return `${fieldName}: ${value.message}`;
                    });

                if (fieldErrors.length > 0) {
                    errorMsg = fieldErrors.join(" | ");
                }
            } else if (error.message) {
                errorMsg = error.message;
            }

            toast({
                title: "Erro no cadastro",
                description: errorMsg,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-fit mb-2">
                    <Image
                        src="/darkstore-logo.png"
                        alt="DarkStore Logo"
                        width={180}
                        height={44}
                        className="object-contain"
                        priority
                    />
                </div>
                <div>
                    <CardTitle className="font-headline text-2xl font-bold tracking-tight">Crie sua conta</CardTitle>
                    <CardDescription className="text-base mt-2">Preencha seus dados para começar.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" placeholder="Seu nome" {...form.register("name")} className={`bg-background/50 ${form.formState.errors.name ? "border-destructive" : "focus:border-primary"}`} />
                        {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="seu@email.com" {...form.register("email")} className={`bg-background/50 ${form.formState.errors.email ? "border-destructive" : "focus:border-primary"}`} />
                        {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">WhatsApp / Telefone</Label>
                        <Input id="phone" placeholder="(11) 99999-9999" {...form.register("phone")} className={`bg-background/50 ${form.formState.errors.phone ? "border-destructive" : "focus:border-primary"}`} />
                        {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input id="password" type="password" placeholder="••••••" {...form.register("password")} className={`bg-background/50 ${form.formState.errors.password ? "border-destructive" : "focus:border-primary"}`} />
                        {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <Input id="confirmPassword" type="password" placeholder="••••••" {...form.register("confirmPassword")} className={`bg-background/50 ${form.formState.errors.confirmPassword ? "border-destructive" : "focus:border-primary"}`} />
                        {form.formState.errors.confirmPassword && <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>}
                    </div>
                </div>

                <Button className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-primary/25 transition-all" onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                    {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-center text-sm text-muted-foreground">
                    Já tem uma conta?{' '}
                    <Link href="/account/login" className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors">
                        Faça login
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
