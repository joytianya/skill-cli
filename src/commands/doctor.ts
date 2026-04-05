import chalk from "chalk";
import os from "os";
import path from "path";
import { scanSkills, expandHome } from "../scanner.js";
import { KNOWN_AGENTS } from "../agents.js";
import type { ScanResult } from "../types.js";

function shortenHome(p: string): string {
  const home = os.homedir();
  return p.startsWith(home) ? "~" + p.slice(home.length) : p;
}

export async function doctorCommand(): Promise<void> {
  const result: ScanResult = await scanSkills();

  console.log(
    `\nScanned ${result.scannedDirs.length} directories, found ${result.skills.length} skills\n`
  );

  for (const agent of KNOWN_AGENTS) {
    const agentSkills = result.skills.filter((s) => s.source.agent === agent.name);
    const agentDirs = agent.paths.map(expandHome);
    const displayPath = shortenHome(agentDirs[0]);

    const wasScanned = agentDirs.some((d) => result.scannedDirs.includes(d));

    const agentErrors = result.errors.filter((e) =>
      agentDirs.some((d) => e.path === d || e.path.startsWith(d + path.sep))
    );

    if (!wasScanned) {
      console.log(
        `${chalk.red("✗")} ${chalk.bold(agent.name.padEnd(10))} ${displayPath.padEnd(30)} ${chalk.gray("(not found)")}`
      );
    } else if (agentErrors.length > 0) {
      console.log(
        `${chalk.yellow("⚠")} ${chalk.bold(agent.name.padEnd(10))} ${displayPath.padEnd(30)} ${agentSkills.length} skills ${chalk.yellow(`(${agentErrors.length} parse errors)`)}`
      );
    } else {
      console.log(
        `${chalk.green("✓")} ${chalk.bold(agent.name.padEnd(10))} ${displayPath.padEnd(30)} ${agentSkills.length} skills`
      );
    }
  }

  if (result.errors.length > 0) {
    console.log(`\n${chalk.red("Errors:")}`);
    for (const err of result.errors) {
      console.log(`  ${shortenHome(err.path)}: ${chalk.red(err.error)}`);
    }
  }

  console.log();
}
