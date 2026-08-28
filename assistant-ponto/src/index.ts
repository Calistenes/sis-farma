import { login } from "./login.js";
import { scrapeTeamTimesheet } from "./scrape.js";
import { analyze } from "./analyze.js";
import { printSummary, writeCsv } from "./report.js";

async function main() {
  const manual = process.argv.includes("--manual-login-setup");

  const context = await login(manual);

  if (manual) {
    console.log("Login salvo em storage-state.json. Rode `npm start` para conferir o ponto.");
    await context.browser()?.close();
    return;
  }

  const raw = await scrapeTeamTimesheet(context);
  const analyzed = analyze(raw);

  printSummary(analyzed);
  const file = writeCsv(analyzed);
  console.log(`\nRelatório salvo em ${file}`);

  await context.browser()?.close();
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
