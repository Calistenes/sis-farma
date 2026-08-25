-- RendaFlow: schema inicial (perfis, categorias, transações)

create extension if not exists "pgcrypto";

-- Perfis (1:1 com auth.users), guarda o plano de assinatura
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuários veem o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários atualizam o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Categorias de receita/despesa, por usuário
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Usuários gerenciam as próprias categorias"
  on public.categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists categories_user_id_idx on public.categories (user_id);

-- Transações (receitas e despesas)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0),
  description text not null default '',
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Usuários gerenciam as próprias transações"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_user_occurred_idx on public.transactions (user_id, occurred_on desc);

-- Cria perfil + categorias padrão automaticamente ao registrar usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));

  insert into public.categories (user_id, name, type, color)
  values
    (new.id, 'Vendas', 'income', '#22c55e'),
    (new.id, 'Serviços prestados', 'income', '#0ea5e9'),
    (new.id, 'Outras receitas', 'income', '#a3e635'),
    (new.id, 'Fornecedores', 'expense', '#ef4444'),
    (new.id, 'Impostos', 'expense', '#f97316'),
    (new.id, 'Operacional', 'expense', '#8b5cf6'),
    (new.id, 'Outras despesas', 'expense', '#6b7280');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
