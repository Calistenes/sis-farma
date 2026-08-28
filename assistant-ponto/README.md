# Assistente de Ponto (Meu RH / TOTVS)

Script local que faz login no portal **Meu RH** (TOTVS) e confere o registro
de ponto dos seus técnicos, apontando pendências (marcação faltando, horas
abaixo do esperado, dia sem registro).

Isso **não** roda como um site publicado nem guarda suas credenciais em
nenhum servidor — é uma ferramenta de linha de comando para rodar na sua
própria máquina.

## Riscos — leia antes de usar

- Automatizar login com usuário/senha em um portal de terceiros pode violar
  os termos de uso do sistema. Confirme que isso é permitido pela sua
  empresa/TI antes de usar em produção.
- O script depende da estrutura HTML da tela do Meu RH, que eu não tenho
  acesso para testar. **Ele provavelmente não vai funcionar de primeira** —
  os seletores em `src/selectors.ts` são um ponto de partida e quase certamente
  precisarão de ajuste manual (veja abaixo).
- Se o login usa CAPTCHA, segundo fator (2FA) ou SSO (Microsoft/Google), o
  preenchimento automático de usuário/senha não funciona — use o modo de
  login manual (abaixo), que só precisa ser feito uma vez.
- Nunca commite o arquivo `.env` nem `storage-state.json` (ambos já estão no
  `.gitignore`) — contêm senha e sessão autenticada, respectivamente.

## Setup

```bash
cd assistant-ponto
npm install
npx playwright install chromium
cp .env.example .env
```

Preencha o `.env`:
- `MEURH_URL`: URL de login do seu Meu RH.
- `MEURH_USERNAME` / `MEURH_PASSWORD`: só preencha se quiser login 100%
  automático. Deixe em branco para logar manualmente (recomendado na
  primeira vez, ou se houver CAPTCHA/2FA/SSO).
- `MEURH_TEAM_TIMESHEET_PATH`: caminho da tela com o espelho de ponto da
  equipe (descubra navegando manualmente e copiando a URL).

## Primeira execução (login manual, recomendado)

```bash
npm run login:setup
```

Abre um navegador visível. Faça login normalmente (usuário, senha, 2FA, o
que for necessário), espere carregar a tela inicial do Meu RH, volte ao
terminal e pressione ENTER. A sessão fica salva em `storage-state.json` e as
próximas execuções reaproveitam esse login sem pedir senha de novo.

## Rodar a conferência

```bash
npm start
```

Isso abre a tela de ponto da equipe, extrai as marcações de cada técnico,
aponta pendências no terminal e salva um CSV em `reports/`.

## Ajustando os seletores

A extração depende de `src/selectors.ts`. Se o script não encontrar nada (0
registros) ou dados errados:

1. Rode com `HEADLESS=false` no `.env` para ver o navegador durante a
   execução.
2. Abra a tela de ponto da equipe manualmente, aperte F12 (DevTools) e
   inspecione a tabela — anote o seletor CSS das linhas e a ordem das
   colunas (técnico, data, marcações).
3. Atualize `selectors.team` em `src/selectors.ts` com esses valores.

## Regras de pendência

Configuráveis no `.env`:
- `MIN_PUNCHES_PER_DAY`: mínimo de marcações esperadas por dia (padrão 4).
- `EXPECTED_DAILY_HOURS`: horas mínimas esperadas por dia (padrão 8).
