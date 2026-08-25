"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

const initialState: AuthState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <Card>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Entrar</h1>
      <p className="mb-6 text-sm text-slate-500">
        Acesse o seu painel de renda.
      </p>
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required autoFocus />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Ainda não tem conta?{" "}
        <Link href="/signup" className="font-medium text-indigo-600">
          Criar conta
        </Link>
      </p>
    </Card>
  );
}
