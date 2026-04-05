#!/usr/bin/env bun
import { Command } from "commander";
import { listCommand } from "./commands/list.js";
import { showCommand } from "./commands/show.js";
import { searchCommand } from "./commands/search.js";
import { doctorCommand } from "./commands/doctor.js";
import { scanCommand } from "./commands/scan.js";
import { pathsCommand } from "./commands/paths.js";

process.on("unhandledRejection", (err) => {
  console.error("Error:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});

const program = new Command();

program
  .name("skill")
  .description("Browse and manage AI agent skills")
  .version("0.1.0");

program
  .command("list")
  .description("List all available skills")
  .option("--agent <name>", "Filter by agent name")
  .option("--json", "Output raw JSON")
  .action((opts) => listCommand(opts));

program
  .command("show <id>")
  .description("Show details for a skill by id or name")
  .action((id) => showCommand(id));

program
  .command("search <query>")
  .description("Search skills by name or description")
  .action((query) => searchCommand(query));

program
  .command("doctor")
  .description("Show a scan report of all agent skill directories")
  .option("--fix", "Attempt to auto-repair YAML parse errors")
  .action((opts) => doctorCommand(opts));

program
  .command("scan")
  .description("Re-scan all agent directories and show updated results")
  .option("--agent <name>", "Only scan a specific agent")
  .option("--json", "Output raw JSON")
  .action((opts) => scanCommand(opts));

program
  .command("paths [subcommand] [directory]")
  .description("Manage custom scan paths (list / add <dir> / remove <dir>)")
  .action((sub = "list", dir) => pathsCommand(sub, dir));

program.parse();
