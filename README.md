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
valores do passo anterior, e `SUPABASE_SERVICE_ROLE_KEY` (mesma tela, campo
"service_role secret" — nunca exponha esse valor no cliente).

### 3. Mercado Pago (assinatura Pro)

1. Em https://www.mercadopago.com.br/developers/panel, pegue o **Access
   Token** (comece pelo de teste) e cole em `MERCADOPAGO_ACCESS_TOKEN`.
2. Em **Webhooks**, crie uma notificação apontando para
   `https://<seu-domínio>/api/webhooks/mercadopago`, evento "Assinaturas"
   (subscription_preapproval). Copie a **Assinatura secreta** gerada e cole
   em `MERCADOPAGO_WEBHOOK_SECRET`.
3. O fluxo: usuário clica em "Assinar Pro" em Configurações → é redirecionado
   pro checkout do Mercado Pago → ao autorizar o cartão, o Mercado Pago
   chama o webhook → o webhook confirma a assinatura direto na API do
   Mercado Pago (nunca confia só no payload recebido) e libera
   `profiles.plan = 'pro'` usando o `service_role` (usuários não conseguem
   alterar o próprio plano direto pela API do Supabase — só essa rota pode).

### 4. Rodar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

### 5. Deploy (Netlify)

Já existe um projeto Supabase (`rendaflow`) e um site Netlify (`rendaflow`,
https://app.netlify.com/projects/rendaflow) criados, com as env vars
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` já configuradas
nele. Adicione também `SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_ACCESS_TOKEN`
e `MERCADOPAGO_WEBHOOK_SECRET` nas env vars do site. Falta só conectar o
repositório para builds automáticos:

1. Acesse https://app.netlify.com/projects/rendaflow.
2. Vá em **Project configuration → Build & deploy → Continuous deployment**
   (ou **Link repository**, se aparecer na tela inicial do site).
3. Conecte ao GitHub e selecione `Calistenes/sis-farma`, branch
   `claude/sistema-gerencia-renda-a2rzs8` (ou `main`, depois que o PR for
   mergeado).
4. O Netlify detecta o Next.js automaticamente e usa o `netlify.toml` deste
   repo (`npm run build`, Node 22). Nenhuma configuração extra é necessária.
5. Depois do primeiro deploy, revise em **Site configuration → Access
   control** se o site deve ficar público (por padrão pode estar exigindo
   login do time/SSO).

## Estrutura

- `src/app/page.tsx` — landing page com pricing (Gratuito / Pro).
- `src/app/(auth)` — login e cadastro (Supabase Auth).
- `src/app/dashboard` — área logada: visão geral, lançamentos, categorias e
  configurações. Protegida via `src/middleware.ts`.
- `src/lib/supabase` — clientes Supabase (browser, server, middleware).
- `src/lib/plan.ts` — regra do plano gratuito (limite de 50 lançamentos/mês).
- `src/lib/mercadopago.ts` — integração com a API de Assinaturas (Preapproval)
  do Mercado Pago.
- `src/app/api/webhooks/mercadopago` — webhook que confirma pagamento e
  libera/revoga o plano Pro.
- `supabase/migrations` — schema SQL e RLS.

## Modelo de negócio

- **Gratuito**: até 50 lançamentos/mês, categorias ilimitadas, dashboard.
- **Pro (R$ 29/mês)**: lançamentos ilimitados, suporte prioritário. Cobrança
  recorrente via Mercado Pago (ver seção de setup acima).

## Próximos passos sugeridos

- Edição de lançamentos (hoje é criar/excluir).
- Exportar relatório em CSV/PDF.
- Suporte a múltiplos negócios/workspaces por usuário.
- Mostrar na tela de Configurações o status "pagamento em confirmação"
  logo após voltar do checkout do Mercado Pago (hoje a tela só reflete o
  plano depois que o webhook processa, geralmente em segundos).
