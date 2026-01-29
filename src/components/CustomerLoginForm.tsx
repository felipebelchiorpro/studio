"use client";

import Image from "next/image";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface CustomerLoginFormProps {
  onSuccess?: () => void;
}

export default function CustomerLoginForm({ onSuccess }: CustomerLoginFormProps) {
  const { customerLogin } = useCustomerAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Note: customerLogin currently handles its own error toasts.
    await customerLogin(data.email, data.password);

    // We only call onSuccess (close modal) if we think it worked. 
    if (onSuccess) onSuccess();
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border border-white/5 bg-[#0a0a0a] text-white">
      <CardHeader className="text-center space-y-4 pb-2">
        <div className="mx-auto w-fit mb-2">
          {/* Logo - Assuming user has this asset, or we use text if fails */}
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/darkstore-logo.png"
              alt="DarkStore Logo"
              width={180}
              height={50}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Bem-vindo de volta!</CardTitle>
          <CardDescription className="text-sm text-gray-400 mt-2">Digite suas credenciais para acessar sua conta.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-customer" className="text-white font-medium">Email</Label>
            <Input
              id="email-customer"
              type="email"
              placeholder="seu@email.com"
              {...form.register("email")}
              className={`bg-white/90 text-black border-0 placeholder:text-gray-500 h-10 ${form.formState.errors.email ? "ring-2 ring-red-500" : "focus-visible:ring-1 focus-visible:ring-gray-300"}`}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500 font-medium">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password-customer" className="text-white font-medium">Senha</Label>
              <Link href="/account/forgot-password" className="text-xs font-medium text-red-500 hover:text-red-400">
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password-customer"
              type="password"
              placeholder="••••••••••••••"
              {...form.register("password")}
              className={`bg-white/90 text-black border-0 placeholder:text-gray-500 h-10 ${form.formState.errors.password ? "ring-2 ring-red-500" : "focus-visible:ring-1 focus-visible:ring-gray-300"}`}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500 font-medium">{form.formState.errors.password.message}</p>
            )}
          </div>
        </div>

        <Button
          type="button"
          className="w-full h-11 text-base font-bold bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all mt-2 rounded-md"
          onClick={form.handleSubmit(onSubmit)}
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
        </Button>

      </CardContent>
      <CardFooter className="justify-center pb-6">
        <p className="text-center text-sm text-gray-400">
          Não tem uma conta?{' '}
          <Link href="/account/register" className="font-semibold text-red-500 hover:text-red-400 transition-colors">
            Cadastre-se grátis
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
