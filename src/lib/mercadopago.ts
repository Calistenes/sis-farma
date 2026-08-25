import { createHmac, timingSafeEqual } from "crypto";

const MP_API = "https://api.mercadopago.com";
export const PRO_PRICE_BRL = 29;

function accessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");
  return token;
}

export type Preapproval = {
  id: string;
  status: "pending" | "authorized" | "paused" | "cancelled";
  external_reference: string | null;
  init_point?: string;
  sandbox_init_point?: string;
};

export async function createPreapproval(params: {
  userId: string;
  backUrl: string;
}): Promise<Preapproval> {
  const response = await fetch(`${MP_API}/preapproval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      // Sem payer_email: a pessoa loga com a própria conta Mercado Pago na
      // hora do checkout (funciona em modo teste e produção sem conflito
      // entre comprador/vendedor "real" x "de teste").
      reason: "RendaFlow Pro",
      external_reference: params.userId,
      back_url: params.backUrl,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: PRO_PRICE_BRL,
        currency_id: "BRL",
      },
      status: "pending",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mercado Pago ${response.status}: ${body}`);
  }

  return response.json();
}

export async function getPreapproval(id: string): Promise<Preapproval> {
  const response = await fetch(`${MP_API}/preapproval/${id}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
  });

  if (!response.ok) {
    throw new Error(`Mercado Pago: falha ao consultar assinatura (${response.status}).`);
  }

  return response.json();
}

export async function cancelPreapproval(id: string): Promise<void> {
  const response = await fetch(`${MP_API}/preapproval/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "cancelled" }),
  });

  if (!response.ok) {
    throw new Error(`Mercado Pago: falha ao cancelar assinatura (${response.status}).`);
  }
}

// Valida a assinatura HMAC do webhook do Mercado Pago.
// Referência: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
export function verifyWebhookSignature(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string;
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret || !params.xSignature || !params.xRequestId) return false;

  const parts = Object.fromEntries(
    params.xSignature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    })
  );
  const ts = parts.ts;
  const receivedHash = parts.v1;
  if (!ts || !receivedHash) return false;

  const manifest = `id:${params.dataId.toLowerCase()};request-id:${params.xRequestId};ts:${ts};`;
  const expectedHash = createHmac("sha256", secret).update(manifest).digest("hex");

  const expected = Buffer.from(expectedHash, "hex");
  const received = Buffer.from(receivedHash, "hex");
  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}
