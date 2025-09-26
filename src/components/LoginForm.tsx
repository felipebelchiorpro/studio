"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    // Simulate login - In a real app, this would call an API
    // Basic check for a demo merchant account.
    const isOldUser = data.email === "merchant@darkstore.com" && data.password === "password";
    const isNewUser = data.email === "contatofelipebelchior@gmail.com" && data.password === "3595157";

    if (isOldUser || isNewUser) {
      login(data.email);
      toast({
        title: "Login bem-sucedido!",
        description: "Redirecionando para o dashboard...",
      });
      router.push("/dashboard");
    } else {
       toast({
        title: "Falha no Login",
        description: "Email ou senha inválidos. Verifique suas credenciais.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl text-primary">Acesso Restrito</CardTitle>
        <CardDescription>Faça login para acessar o painel do comerciante.</CardDescription>
      </CardHeader>
      {/* Using div as form root to attach react-hook-form handleSubmit to button onClick */}
      <div> 
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
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
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
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
        </CardContent>
        <CardFooter>
          {/* 
            Per instructions: "Evite usar <form> onSubmit ...; use eventos de clique para formulários."
            react-hook-form's handleSubmit can be triggered by button's onClick.
          */}
          <Button 
            type="button" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
