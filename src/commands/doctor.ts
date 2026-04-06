import chalk from "chalk";
import fs from "fs";
import path from "path";
import { scanSkills } from "../scanner.js";
import { expandHome, shortenHome } from "../utils.js";
import { KNOWN_AGENTS } from "../agents.js";
import type { ScanResult } from "../types.js";

/**
 * Attempt to auto-fix a SKILL.md with YAML frontmatter errors.
 * Strategy: re-parse the raw frontmatter block line by line, keeping only
 * lines that look like valid YAML key: value pairs or list items, then
 * rewrite the file with the cleaned frontmatter + original body.
 *
 * Returns true if the file was modified.
 */
function tryFix(filePath: string): { fixed: boolean; reason: string } {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch (e) {
    return { fixed: false, reason: `cannot read: ${e}` };
  }

  // Extract frontmatter block between first pair of ---
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)([\s\S]*)/);
  if (!match) return { fixed: false, reason: "no frontmatter found" };

  const [, fmRaw, , body] = match;
  const lines = fmRaw.split(/\r?\n/);
  const cleaned: string[] = [];

  for (const line of lines) {
    // Keep blank lines, comments, list items, and key: value lines
    // Drop lines that are bare strings (no colon, not a list item, not blank)
    const trimmed = line.trim();
    if (
      trimmed === "" ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("- ") ||
      /^[\w-]+\s*:/.test(trimmed) ||   // key: ...
      /^\s+[\w-]+\s*:/.test(line) ||   // indented key: ...
      /^\s+- /.test(line)              // indented list item
    ) {
      // Additionally fix unescaped double-quoted strings that contain bare "
      // by switching to single-quote wrapping when safe
      cleaned.push(fixQuotes(line));
    }
    // else: drop the line (it's a stray bare string causing parse errors)
  }

  const newContent = `---\n${cleaned.join("\n")}\n---\n${body}`;
  if (newContent === raw) return { fixed: false, reason: "no changes needed" };

  // Backup original
  fs.writeFileSync(filePath + ".bak", raw, "utf-8");
  fs.writeFileSync(filePath, newContent, "utf-8");
  return { fixed: true, reason: "cleaned stray lines; backup saved as .bak" };
}

/**
 * If a YAML value is double-quoted and contains unescaped double quotes,
 * try to re-wrap with single quotes (only if value has no single quotes).
 */
function fixQuotes(line: string): string {
  // Match:  key: "value with "inner" quotes"
  const m = line.match(/^(\s*[\w-]+\s*:\s*)"(.*)"(\s*)$/s);
  if (!m) return line;
  const [, prefix, inner, suffix] = m;
  // Count unescaped double quotes inside
  const unescaped = (inner.match(/(?<!\\)"/g) || []).length;
  if (unescaped === 0) return line; // already fine
  if (!inner.includes("'")) {
    // Safe to use single quotes
    return `${prefix}'${inner}'${suffix}`;
  }
  // Fallback: escape the inner double quotes
  return `${prefix}"${inner.replace(/(?<!\\)"/g, '\\"')}"${suffix}`;
}

export async function doctorCommand(opts: { fix?: boolean } = {}): Promise<void> {
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

  if (result.errors.length === 0) {
    console.log();
    return;
  }

  console.log(`\n${chalk.red("Errors:")}`);
  for (const err of result.errors) {
    console.log(`  ${shortenHome(err.path)}: ${chalk.red(err.error)}`);
  }

  if (!opts.fix) {
    console.log(chalk.gray(`\nRun \`skill doctor --fix\` to attempt auto-repair.\n`));
    return;
  }

  // --fix mode
  console.log(`\n${chalk.cyan("Attempting auto-fix...")}\n`);
  let fixedCount = 0;
  for (const err of result.errors) {
    if (!err.path.endsWith(".md")) continue;
    const result2 = tryFix(err.path);
    if (result2.fixed) {
      console.log(`  ${chalk.green("✓ fixed")}  ${shortenHome(err.path)}`);
      console.log(`           ${chalk.gray(result2.reason)}`);
      fixedCount++;
    } else {
      console.log(`  ${chalk.yellow("✗ skipped")} ${shortenHome(err.path)}: ${chalk.gray(result2.reason)}`);
    }
  }

  console.log();
  if (fixedCount > 0) {
    console.log(chalk.green(`Fixed ${fixedCount} file(s). Run \`skill doctor\` to verify.`));
    console.log(chalk.gray("Original files backed up as <file>.bak"));
  } else {
    console.log(chalk.yellow("No files could be auto-fixed. Manual editing required."));
  }
  console.log();
}
