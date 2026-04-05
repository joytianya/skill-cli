import chalk from "chalk";
import { scanSkills } from "../scanner.js";
import { renderTable } from "./list.js";

export async function scanCommand(opts: {
  agent?: string;
  json?: boolean;
}): Promise<void> {
  console.log(chalk.cyan("Scanning agent directories..."));
  const start = Date.now();
  const result = await scanSkills();
  const elapsed = Date.now() - start;

  let skills = result.skills;
  if (opts.agent) {
    skills = skills.filter((s) => s.source.agent === opts.agent);
  }

  if (opts.json) {
    console.log(JSON.stringify({ skills, errors: result.errors, scannedDirs: result.scannedDirs }, null, 2));
    return;
  }

  console.log(
    chalk.green(`✓`) +
    ` Found ${chalk.bold(String(skills.length))} skills across ${result.scannedDirs.length} directories` +
    chalk.gray(` (${elapsed}ms)`)
  );

  if (result.errors.length > 0) {
    console.log(chalk.yellow(`⚠ ${result.errors.length} parse error(s) — run \`skill doctor\` for details`));
  }

  console.log();
  renderTable(skills);
}
