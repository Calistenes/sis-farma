"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

const initialState: AuthState = { error: null };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <Card>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">
        Criar conta
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Comece grátis, sem cartão de crédito.
      </p>
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Nome</Label>
          <Input id="fullName" name="fullName" type="text" required autoFocus />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
          />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Criando conta..." : "Criar conta grátis"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-indigo-600">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
