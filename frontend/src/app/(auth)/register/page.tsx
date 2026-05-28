"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerRequest } from "@/lib/api";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "" });

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirm) {
      toast.error("Le password non coincidono");
      return;
    }
    if (form.password.length < 8) {
      toast.error("La password deve essere di almeno 8 caratteri");
      return;
    }

    startTransition(async () => {
      try {
        await registerRequest(form.email, form.password, form.full_name || undefined);

        // Login automatico dopo la registrazione
        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Registrazione completata, ma login fallito. Accedi manualmente.");
          router.push("/login");
        } else {
          toast.success("Account creato con successo!");
          router.push("/dashboard");
          router.refresh();
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detail = err.response?.data?.detail;
          if (err.response?.status === 409) {
            toast.error("Email già registrata. Prova ad accedere.");
          } else {
            toast.error(detail ?? "Errore durante la registrazione");
          }
        } else {
          toast.error("Errore imprevisto. Riprova.");
        }
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Crea un account</CardTitle>
          <CardDescription>Inserisci i tuoi dati per registrarti</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input
                id="full_name"
                placeholder="Mario Rossi"
                value={form.full_name}
                onChange={set("full_name")}
                data-testid="register-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario@esempio.com"
                value={form.email}
                onChange={set("email")}
                required
                data-testid="register-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimo 8 caratteri"
                value={form.password}
                onChange={set("password")}
                required
                data-testid="register-password-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Conferma password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Ripeti la password"
                value={form.confirm}
                onChange={set("confirm")}
                required
                data-testid="register-confirm-input"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
              data-testid="register-button"
            >
              {isPending ? "Creazione account…" : "Registrati"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Hai già un account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Accedi
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
