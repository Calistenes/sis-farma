import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries";

export async function requireProUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    } as const;
  }

  const profile = await getProfile(supabase, user.id);
  if (profile.plan !== "pro") {
    return {
      error: NextResponse.json(
        { error: "Recurso disponível apenas no plano Pro." },
        { status: 403 }
      ),
    } as const;
  }

  return { supabase, userId: user.id } as const;
}
