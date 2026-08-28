import "dotenv/config";

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} não definida. Copie .env.example para .env e preencha.`
    );
  }
  return value;
}

export const config = {
  meurhUrl: required("MEURH_URL", process.env.MEURH_URL),
  username: process.env.MEURH_USERNAME ?? "",
  password: process.env.MEURH_PASSWORD ?? "",
  teamTimesheetPath: process.env.MEURH_TEAM_TIMESHEET_PATH ?? "",
  headless: process.env.HEADLESS !== "false",
  expectedDailyHours: Number(process.env.EXPECTED_DAILY_HOURS ?? 8),
  minPunchesPerDay: Number(process.env.MIN_PUNCHES_PER_DAY ?? 4),
  storageStatePath: new URL("../storage-state.json", import.meta.url).pathname,
};

export const hasCredentials = Boolean(config.username && config.password);
