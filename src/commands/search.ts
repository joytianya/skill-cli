import chalk from "chalk";
import { scanSkills } from "../scanner.js";
import { renderTable } from "./list.js";

export async function searchCommand(query: string): Promise<void> {
  const result = await scanSkills();
  const q = query.toLowerCase();
  const skills = result.skills.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
  );

  if (skills.length === 0) {
    console.log(chalk.yellow(`No skills matching "${query}".`));
    return;
  }

  renderTable(skills, query);
}
