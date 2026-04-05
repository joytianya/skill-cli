import chalk from "chalk";
import os from "os";
import { addPath, removePath, listPaths } from "../config.js";

function shortenHome(p: string): string {
  const home = os.homedir();
  return p.startsWith(home) ? "~" + p.slice(home.length) : p;
}

export function pathsCommand(sub: string, target?: string): void {
  if (sub === "list" || !sub) {
    const paths = listPaths();
    if (paths.length === 0) {
      console.log(chalk.gray("No custom paths configured."));
      console.log(chalk.gray("Add one with: skill paths add <dir>"));
      return;
    }
    console.log(chalk.bold("Custom scan paths:"));
    for (const p of paths) {
      console.log(`  ${chalk.cyan(shortenHome(p))}`);
    }
    return;
  }

  if (sub === "add") {
    if (!target) {
      console.error(chalk.red("Usage: skill paths add <directory>"));
      process.exit(1);
    }
    const result = addPath(target);
    if (!result.added) {
      console.log(chalk.yellow(`Path already exists: ${shortenHome(target)}`));
    } else {
      console.log(chalk.green(`✓ Added: ${shortenHome(target)}`));
      console.log(chalk.gray("Run `skill scan` to see updated results."));
    }
    return;
  }

  if (sub === "remove") {
    if (!target) {
      console.error(chalk.red("Usage: skill paths remove <directory>"));
      process.exit(1);
    }
    const result = removePath(target);
    if (!result.removed) {
      console.log(chalk.yellow(`Path not found: ${shortenHome(target)}`));
    } else {
      console.log(chalk.green(`✓ Removed: ${shortenHome(target)}`));
    }
    return;
  }

  console.error(chalk.red(`Unknown subcommand: ${sub}`));
  console.error("Usage: skill paths [list|add|remove] [directory]");
  process.exit(1);
}
