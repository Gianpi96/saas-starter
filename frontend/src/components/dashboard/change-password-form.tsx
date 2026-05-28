"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { changePassword } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

const EMPTY = { current: "", next: "", confirm: "" };

export function ChangePasswordForm() {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;

    if (form.next !== form.confirm) {
      toast.error("Le nuove password non coincidono");
      return;
    }
    if (form.next.length < 8) {
      toast.error("La nuova password deve essere di almeno 8 caratteri");
      return;
    }
    if (form.next === form.current) {
      toast.error("La nuova password deve essere diversa da quella attuale");
      return;
    }

    startTransition(async () => {
      try {
        await changePassword(session.accessToken, form.current, form.next);
        toast.success("Password aggiornata con successo");
        setForm(EMPTY);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detail = err.response?.data?.detail;
          if (err.response?.status === 400) {
            toast.error(detail ?? "Password attuale non corretta");
          } else {
            toast.error(detail ?? "Errore durante il cambio password");
          }
        } else {
          toast.error("Errore imprevisto");
        }
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambia password</CardTitle>
        <CardDescription>Imposta una nuova password per il tuo account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Password attuale</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="••••••••"
              value={form.current}
              onChange={set("current")}
              required
              data-testid="current-password-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nuova password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Minimo 8 caratteri"
              value={form.next}
              onChange={set("next")}
              required
              data-testid="new-password-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Conferma nuova password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Ripeti la nuova password"
              value={form.confirm}
              onChange={set("confirm")}
              required
              data-testid="confirm-password-input"
            />
          </div>
          <Button type="submit" disabled={isPending} data-testid="change-password-button">
            {isPending ? "Aggiornamento…" : "Aggiorna password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
