# RendaFlow

SaaS de controle de renda para autônomos e pequenos negócios: lançamento de
receitas e despesas, categorias, dashboard com saldo e histórico mensal, e
gate de plano (Gratuito x Pro) pensado para ser vendido por assinatura.

Stack: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase
(Auth + Postgres + RLS).

## Setup

### 1. Criar o projeto no Supabase

1. Crie um projeto em https://supabase.com.
2. Em **SQL Editor**, rode o conteúdo de `supabase/migrations/0001_init.sql`
   (cria as tabelas `profiles`, `categories`, `transactions`, as políticas de
   RLS e o trigger que cria perfil + categorias padrão no cadastro).
   Se preferir a CLI: `supabase link` e depois `supabase db push`.
3. Em **Project Settings → API**, copie a `Project URL` e a `anon public key`.

### 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os
valores do passo anterior.

### 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

## Estrutura

- `src/app/page.tsx` — landing page com pricing (Gratuito / Pro).
- `src/app/(auth)` — login e cadastro (Supabase Auth).
- `src/app/dashboard` — área logada: visão geral, lançamentos, categorias e
  configurações. Protegida via `src/middleware.ts`.
- `src/lib/supabase` — clientes Supabase (browser, server, middleware).
- `src/lib/plan.ts` — regra do plano gratuito (limite de 50 lançamentos/mês).
- `supabase/migrations` — schema SQL e RLS.

## Modelo de negócio

- **Gratuito**: até 50 lançamentos/mês, categorias ilimitadas, dashboard.
- **Pro (R$ 29/mês)**: lançamentos ilimitados, suporte prioritário.

O upgrade para Pro está com o botão desabilitado (stub) — falta integrar um
provedor de pagamento recorrente (ex.: Stripe Billing ou Mercado Pago
assinaturas) para:

1. Criar o checkout de assinatura a partir de **Configurações**.
2. Receber o webhook de pagamento confirmado e atualizar
   `profiles.plan = 'pro'`.
3. Tratar cancelamento/downgrade quando a assinatura expirar.

## Próximos passos sugeridos

- Integração de cobrança recorrente (Stripe/Mercado Pago).
- Edição de lançamentos (hoje é criar/excluir).
- Exportar relatório em CSV/PDF.
- Suporte a múltiplos negócios/workspaces por usuário.
