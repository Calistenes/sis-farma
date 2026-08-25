-- RendaFlow: assinatura Pro via Mercado Pago

alter table public.profiles
  add column if not exists mp_preapproval_id text,
  add column if not exists plan_updated_at timestamptz not null default now();

create index if not exists profiles_mp_preapproval_id_idx
  on public.profiles (mp_preapproval_id);

-- Trava de segurança: usuários podem editar o próprio nome, mas não o
-- próprio plano/assinatura direto pela API do Supabase. Só o service_role
-- (usado pelo webhook do Mercado Pago) pode alterar essas colunas.
revoke update on public.profiles from authenticated, anon;
grant update (full_name) on public.profiles to authenticated;
