import { chromium, type BrowserContext } from "playwright";
import fs from "node:fs";
import { config, hasCredentials } from "./config.js";
import { selectors } from "./selectors.js";

/**
 * Faz login no Meu RH e devolve um BrowserContext autenticado.
 *
 * - Se MEURH_USERNAME/MEURH_PASSWORD estiverem definidos, preenche o
 *   formulário automaticamente.
 * - Caso contrário (ou se `manual` for true), abre o navegador visível e
 *   espera você logar manualmente — necessário se o portal usa CAPTCHA,
 *   segundo fator ou login via SSO (Microsoft/Google).
 *
 * Em ambos os casos a sessão (cookies) é salva em storage-state.json para
 * reaproveitar em execuções futuras sem repetir o login.
 */
export async function login(manual = false): Promise<BrowserContext> {
  const reuseSession = fs.existsSync(config.storageStatePath);

  const browser = await chromium.launch({ headless: manual ? false : config.headless });
  const context = await browser.newContext(
    reuseSession ? { storageState: config.storageStatePath } : {}
  );

  if (reuseSession) {
    return context;
  }

  const page = await context.newPage();
  await page.goto(config.meurhUrl);

  if (!manual && hasCredentials) {
    await page.fill(selectors.login.username, config.username);
    await page.fill(selectors.login.password, config.password);
    await page.click(selectors.login.submit);
    await page.waitForLoadState("networkidle");
  } else {
    console.log(
      "\nFaça login manualmente na janela do navegador que abriu.\n" +
        "Depois de estar logado e ver a tela inicial do Meu RH, volte aqui e pressione ENTER.\n"
    );
    await waitForEnter();
  }

  await context.storageState({ path: config.storageStatePath });
  return context;
}

function waitForEnter(): Promise<void> {
  return new Promise((resolve) => {
    process.stdin.once("data", () => resolve());
  });
}
