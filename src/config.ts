import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".skill-cli");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

interface Config {
  extraPaths: string[];
}

function readConfig(): Config {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      extraPaths: Array.isArray(parsed.extraPaths) ? parsed.extraPaths : [],
    };
  } catch {
    return { extraPaths: [] };
  }
}

function writeConfig(config: Config): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

export function getExtraPaths(): string[] {
  return readConfig().extraPaths;
}

export function addPath(p: string): { added: boolean; reason?: string } {
  const expanded = p.startsWith("~/") ? path.join(os.homedir(), p.slice(2)) : path.resolve(p);
  const config = readConfig();
  if (config.extraPaths.includes(expanded)) {
    return { added: false, reason: "already exists" };
  }
  config.extraPaths.push(expanded);
  writeConfig(config);
  return { added: true };
}

export function removePath(p: string): { removed: boolean } {
  const expanded = p.startsWith("~/") ? path.join(os.homedir(), p.slice(2)) : path.resolve(p);
  const config = readConfig();
  const before = config.extraPaths.length;
  config.extraPaths = config.extraPaths.filter((ep) => ep !== expanded);
  if (config.extraPaths.length === before) return { removed: false };
  writeConfig(config);
  return { removed: true };
}

export function listPaths(): string[] {
  return readConfig().extraPaths;
}
