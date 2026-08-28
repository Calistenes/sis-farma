import fs from "node:fs";
import path from "node:path";
import type { AnalyzedRecord } from "./analyze.js";

export function printSummary(records: AnalyzedRecord[]): void {
  const withIssues = records.filter((r) => r.issues.length > 0);

  console.log(`\nRegistros analisados: ${records.length}`);
  console.log(`Registros com pendência: ${withIssues.length}\n`);

  for (const r of withIssues) {
    console.log(`- ${r.technician} (${r.date}): ${r.issues.join("; ")}`);
  }

  if (withIssues.length === 0) {
    console.log("Nenhuma pendência encontrada. ✔");
  }
}

export function writeCsv(records: AnalyzedRecord[]): string {
  const dir = path.resolve("reports");
  fs.mkdirSync(dir, { recursive: true });

  const file = path.join(dir, `ponto-${new Date().toISOString().slice(0, 10)}.csv`);
  const header = "tecnico,data,marcacoes,horas_trabalhadas,pendencias\n";
  const rows = records
    .map((r) =>
      [r.technician, r.date, r.punches.join(" "), r.workedHours ?? "", r.issues.join(" | ")]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  fs.writeFileSync(file, header + rows, "utf-8");
  return file;
}
