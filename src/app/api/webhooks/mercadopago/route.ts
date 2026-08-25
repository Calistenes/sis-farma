import { NextResponse } from "next/server";
import { getPreapproval, verifyWebhookSignature } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan } from "@/lib/types";

function planForStatus(status: string): Plan | null {
  if (status === "authorized") return "pro";
  if (status === "cancelled" || status === "paused") return "free";
  return null; // "pending" - ainda aguardando confirmação, não muda o plano
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const dataId: string | undefined = body?.data?.id;
  const type: string | undefined = body?.type;

  if (!dataId) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const isValid = verifyWebhookSignature({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
  });

  if (!isValid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  if (type !== "subscription_preapproval" && type !== "preapproval") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const preapproval = await getPreapproval(dataId);
  const userId = preapproval.external_reference;
  const nextPlan = planForStatus(preapproval.status);

  if (userId && nextPlan) {
    const admin = createAdminClient();
    await admin
      .from("profiles")
      .update({
        plan: nextPlan,
        mp_preapproval_id: preapproval.id,
        plan_updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
