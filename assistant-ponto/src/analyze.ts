import { config } from "./config.js";
import type { RawRecord } from "./scrape.js";

export interface AnalyzedRecord {
  technician: string;
  date: string;
  punches: string[];
  workedHours: number | null;
  issues: string[];
}

const TIME_RE = /\d{1,2}:\d{2}/g;

function parsePunches(punchesText: string): string[] {
  return punchesText.match(TIME_RE) ?? [];
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function workedHours(punches: string[]): number | null {
  if (punches.length === 0 || punches.length % 2 !== 0) return null;
  let minutes = 0;
  for (let i = 0; i < punches.length; i += 2) {
    minutes += toMinutes(punches[i + 1]) - toMinutes(punches[i]);
  }
  return Math.round((minutes / 60) * 100) / 100;
}

export function analyze(records: RawRecord[]): AnalyzedRecord[] {
  return records.map((record) => {
    const punches = parsePunches(record.punchesText);
    const hours = workedHours(punches);
    const issues: string[] = [];

    if (punches.length === 0) {
      issues.push("Nenhuma marcação encontrada (possível falta ou dia não registrado)");
    } else if (punches.length % 2 !== 0) {
      issues.push("Número ímpar de marcações (batida faltando)");
    } else if (punches.length < config.minPunchesPerDay) {
      issues.push(`Menos de ${config.minPunchesPerDay} marcações no dia`);
    }

    if (hours !== null && hours < config.expectedDailyHours) {
      issues.push(
        `Horas trabalhadas (${hours}h) abaixo do esperado (${config.expectedDailyHours}h)`
      );
    }

    return { technician: record.technician, date: record.date, punches, workedHours: hours, issues };
  });
}
