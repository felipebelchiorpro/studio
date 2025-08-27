
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomerAuth } from "@/context/CustomerAuthContext"; // Changed to useCustomerAuth
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function CustomerLoginForm() {
  const { customerLogin } = useCustomerAuth(); // Changed to customerLogin
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    // Simulate customer login
    if (data.email === "customer@darkstore.com" && data.password === "password123") {
      customerLogin(data.email, "Cliente Exemplo"); // Pass name if available, or default
      toast({
        title: "Login bem-sucedido!",
        description: "Bem-vindo(a) de volta!",
      });
      const redirectUrl = searchParams.get('redirect') || '/account/dashboard';
      router.push(redirectUrl);
    } else {
       toast({
        title: "Falha no Login",
        description: "Email ou senha inválidos. Use customer@darkstore.com e password123 para teste.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl text-primary">Acesse sua Conta</CardTitle>
        <CardDescription>Faça login para ver seus pedidos e mais.</CardDescription>
      </CardHeader>
      <div> 
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-customer">Email</Label>
            <Input
              id="email-customer"
              type="email"
              placeholder="seuemail@exemplo.com"
              {...form.register("email")}
              className={form.formState.errors.email ? "border-destructive" : ""}
              aria-invalid={form.formState.errors.email ? "true" : "false"}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-customer">Senha</Label>
            <Input
              id="password-customer"
              type="password"
              placeholder="********"
              {...form.register("password")}
              className={form.formState.errors.password ? "border-destructive" : ""}
              aria-invalid={form.formState.errors.password ? "true" : "false"}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="text-sm text-right">
            <Link href="/account/forgot-password" className="font-medium text-primary hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="button" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
           <div className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/account/register" className="font-medium text-primary hover:underline">
              Cadastre-se aqui
            </Link>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
