
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useEffect } from "react";

const customerSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  phone: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded?: () => void; // Callback after customer is successfully added
}

export default function CustomerFormDialog({ open, onOpenChange, onCustomerAdded }: CustomerFormDialogProps) {
  const { registerCustomerByAdmin } = useCustomerAuth();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: "", email: "", phone: "" }); // Reset form when dialog opens
    }
  }, [open, form]);

  const onSubmit = async (data: CustomerFormValues) => {
    const success = await registerCustomerByAdmin(data);
    if (success) {
      onOpenChange(false); // Close dialog on success
      if (onCustomerAdded) {
        onCustomerAdded(); // Call the callback to refresh list or similar
      }
    }
    // Error toast is handled within registerCustomerByAdmin context function
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl text-primary">Adicionar Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para cadastrar um novo cliente no sistema.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right col-span-1">Nome</Label>
              <div className="col-span-3">
                <Input id="name" {...form.register("name")} className={form.formState.errors.name ? "border-destructive" : ""} />
                {form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right col-span-1">Email</Label>
              <div className="col-span-3">
                <Input id="email" type="email" {...form.register("email")} className={form.formState.errors.email ? "border-destructive" : ""} />
                {form.formState.errors.email && <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right col-span-1">Telefone</Label>
              <div className="col-span-3">
                <Input id="phone" {...form.register("phone")} placeholder="(11) 99999-9999" />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {form.formState.isSubmitting ? "Adicionando..." : "Adicionar Cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}
