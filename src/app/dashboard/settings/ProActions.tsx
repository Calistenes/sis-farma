"use client";

import { useActionState } from "react";
import {
  startProCheckout,
  cancelProSubscription,
  type ProActionState,
} from "./actions";
import { Button } from "@/components/ui/Button";
import { PRO_PRICE_BRL } from "@/lib/mercadopago";

const initialState: ProActionState = { error: null };

export function SubscribeProForm() {
  const [state, formAction, pending] = useActionState(
    startProCheckout,
    initialState
  );

  return (
    <div className="mt-4 rounded-lg bg-indigo-50 p-4">
      <p className="text-sm text-indigo-900">
        Assine o plano Pro (R$ {PRO_PRICE_BRL}/mês) para lançamentos
        ilimitados e suporte prioritário. Pagamento processado pelo Mercado
        Pago.
      </p>
      <form action={formAction}>
        <Button type="submit" className="mt-3" disabled={pending}>
          {pending ? "Abrindo checkout..." : "Assinar Pro"}
        </Button>
      </form>
      {state.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
    </div>
  );
}

export function CancelProForm() {
  const [state, formAction, pending] = useActionState(
    cancelProSubscription,
    initialState
  );

  return (
    <div className="mt-4">
      <form action={formAction}>
        <Button type="submit" variant="danger" disabled={pending}>
          {pending ? "Cancelando..." : "Cancelar assinatura"}
        </Button>
      </form>
      {state.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
    </div>
  );
}
