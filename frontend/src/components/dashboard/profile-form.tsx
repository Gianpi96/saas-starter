"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { updateProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

export function ProfileForm() {
  const { data: session } = useSession();
  // isPending è true quando non ci sono ancora dati (incluso il caso enabled:false)
  // isLoading è false quando enabled:false — per questo usare !user è più sicuro
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ full_name: "", email: "" });

  // Precompila il form quando i dati arrivano
  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name ?? "", email: user.email });
    }
  }, [user]);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;

    startTransition(async () => {
      try {
        await updateProfile(session.accessToken, {
          full_name: form.full_name || undefined,
          email: form.email !== user?.email ? form.email : undefined,
        });
        await queryClient.invalidateQueries({ queryKey: ["user", "me"] });
        toast.success("Profilo aggiornato con successo");
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detail = err.response?.data?.detail;
          if (err.response?.status === 409) {
            toast.error("Email già in uso da un altro account");
          } else {
            toast.error(detail ?? "Errore durante l'aggiornamento");
          }
        } else {
          toast.error("Errore imprevisto");
        }
      }
    });
  }

  // Mostra lo skeleton finché i dati utente non sono disponibili
  // (copre sia il caso session-loading sia il caso query-fetching)
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-56 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informazioni personali</CardTitle>
        <CardDescription>Aggiorna il tuo nome e indirizzo email</CardDescription>
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
              data-testid="profile-name-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={form.email}
              onChange={set("email")}
              required
              data-testid="profile-email-input"
            />
          </div>
          <Button type="submit" disabled={isPending} data-testid="profile-save-button">
            {isPending ? "Salvataggio…" : "Salva modifiche"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
