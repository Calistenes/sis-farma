/**
 * Seletores da página de login e da página de espelho de ponto da equipe.
 *
 * IMPORTANTE: eu (Claude) não tenho acesso ao seu portal Meu RH real, então
 * estes seletores são um ponto de partida com base no padrão comum de telas
 * TOTVS — quase certamente vão precisar de ajuste.
 *
 * Como ajustar: rode `npm run login:setup` (abre o navegador visível), faça
 * login manualmente, abra o DevTools (F12) na tela de login e na tela de
 * ponto da equipe, e troque os valores abaixo pelos seletores reais
 * (atributo `id`, `name`, ou `data-*` do campo/tabela).
 */
export const selectors = {
  login: {
    username: 'input[name="username"], input[type="email"], #username',
    password: 'input[name="password"], input[type="password"], #password',
    submit: 'button[type="submit"], button:has-text("Entrar")',
  },
  team: {
    // Seletor do container/linhas da tabela de marcações da equipe.
    tableRow: "table tbody tr",
    // Índices das colunas dentro de cada linha (ajuste conforme a tela real).
    columns: {
      technician: 0,
      date: 1,
      punches: 2,
    },
  },
};
