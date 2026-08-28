import type { BrowserContext } from "playwright";
import { config } from "./config.js";
import { selectors } from "./selectors.js";

export interface RawRecord {
  technician: string;
  date: string;
  punchesText: string;
}

export async function scrapeTeamTimesheet(context: BrowserContext): Promise<RawRecord[]> {
  const page = await context.newPage();

  const target = config.teamTimesheetPath
    ? new URL(config.teamTimesheetPath, config.meurhUrl).toString()
    : config.meurhUrl;

  await page.goto(target);
  await page.waitForLoadState("networkidle");

  const rows = await page.$$(selectors.team.tableRow);
  const { technician, date, punches } = selectors.team.columns;

  const records: RawRecord[] = [];
  for (const row of rows) {
    const cells = await row.$$eval("td, th", (tds) => tds.map((td) => td.textContent?.trim() ?? ""));
    if (cells.length <= Math.max(technician, date, punches)) continue;

    records.push({
      technician: cells[technician],
      date: cells[date],
      punchesText: cells[punches],
    });
  }

  return records;
}
