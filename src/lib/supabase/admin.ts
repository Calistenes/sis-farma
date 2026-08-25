import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente com service_role: ignora RLS. Uso restrito a rotas de servidor
// que não têm uma sessão de usuário (ex.: webhooks), nunca no browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado.");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
