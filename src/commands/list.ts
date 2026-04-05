import chalk from "chalk";
import Table from "cli-table3";
import { scanSkills } from "../scanner.js";
import type { Skill } from "../types.js";

export function renderTable(skills: Skill[], query?: string): void {
  const table = new Table({
    head: ["NAME", "AGENT", "VERSION", "DESCRIPTION"].map((h) =>
      chalk.bold(h)
    ),
    style: { border: [], head: [] },
    chars: {
      top: "─", "top-mid": "─", "top-left": "─", "top-right": "─",
      bottom: "─", "bottom-mid": "─", "bottom-left": "─", "bottom-right": "─",
      left: "", "left-mid": "", mid: "─", "mid-mid": "─",
      right: "", "right-mid": "", middle: "  ",
    },
  });

  const maxDesc = 60;
  for (const skill of skills) {
    const name = query ? highlight(skill.name, query) : skill.name;
    const rawDesc = skill.description.length > maxDesc
      ? skill.description.slice(0, maxDesc - 1) + "…"
      : skill.description;
    const desc = query ? highlight(rawDesc, query) : rawDesc;
    table.push([
      name,
      chalk.cyan(skill.source.agent),
      skill.version ? chalk.gray(skill.version) : chalk.gray("-"),
      desc,
    ]);
  }

  console.log(table.toString());
}

function highlight(text: string, query: string): string {
  const re = new RegExp(`(${escapeRegex(query)})`, "gi");
  return text.replace(re, (m) => chalk.yellow.bold(m));
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listCommand(opts: {
  agent?: string;
  json?: boolean;
}): Promise<void> {
  const result = await scanSkills();
  let skills = result.skills;

  if (opts.agent) {
    skills = skills.filter((s) => s.source.agent === opts.agent);
  }

  if (opts.json) {
    try {
      console.log(JSON.stringify(skills, null, 2));
    } catch {
      console.error(chalk.red("Failed to serialize skills to JSON."));
      process.exit(1);
    }
    return;
  }

  if (skills.length === 0) {
    console.log(chalk.yellow("No skills found."));
    return;
  }

  renderTable(skills);
}
