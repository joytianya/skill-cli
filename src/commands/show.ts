import chalk from "chalk";
import { scanSkills } from "../scanner.js";

export async function showCommand(id: string): Promise<void> {
  const result = await scanSkills();
  const skill = result.skills.find((s) => s.id === id || s.name === id);

  if (!skill) {
    console.error(chalk.red(`Skill not found: ${id}`));
    process.exit(1);
  }

  const sep = "─".repeat(Math.max(skill.id.length + 2, 40));
  console.log(`\n${chalk.bold(skill.name)} ${chalk.gray(`(${skill.id})`)}`);
  console.log(sep);
  console.log(`${"Description:".padEnd(13)} ${skill.description || chalk.gray("(none)")}`);
  console.log(`${"Agent:".padEnd(13)} ${chalk.cyan(skill.source.agent)}`);
  console.log(`${"Path:".padEnd(13)} ${skill.source.path}`);
  console.log(`${"Version:".padEnd(13)} ${skill.version ? chalk.gray(skill.version) : chalk.gray("-")}`);
  if (skill.tags && skill.tags.length > 0) {
    console.log(`${"Tags:".padEnd(13)} ${skill.tags.join(", ")}`);
  }
  console.log();
}
