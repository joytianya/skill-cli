import fs from "fs";
import path from "path";
import os from "os";
import matter from "gray-matter";
import { KNOWN_AGENTS } from "./agents.js";
import { getExtraPaths } from "./config.js";
import type { Skill, ScanResult, AgentSource } from "./types.js";

export function expandHome(p: string): string {
  if (p.startsWith("~/")) return path.join(os.homedir(), p.slice(2));
  return p;
}

// Strip ANSI escape sequences and C0/C1 control characters from untrusted strings
function sanitize(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "").replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g, "");
}

const MAX_SCAN_DEPTH = 10;

function findSkillFiles(dir: string, depth = 0): string[] {
  if (depth > MAX_SCAN_DEPTH) return [];
  const results: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSkillFiles(full, depth + 1));
    } else if (entry.isFile() && /^skill\.md$/i.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

function parseSkillFile(
  filePath: string,
  agent: string
): Skill | null {
  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return null;
  }
  if (stat.size > MAX_FILE_SIZE) return null;

  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
  const { data } = matter(content);
  const dir = path.dirname(filePath);
  const dirName = path.basename(dir);
  const name: string = sanitize(typeof data.name === "string" && data.name ? data.name : dirName);
  const description: string = sanitize(typeof data.description === "string" ? data.description : "");
  const version: string | undefined = typeof data.version === "string" ? sanitize(data.version) : undefined;
  const tags: string[] | undefined = Array.isArray(data.tags)
    ? data.tags.filter((t): t is string => typeof t === "string").map(sanitize)
    : undefined;

  return {
    id: `${agent}:${name}`,
    name,
    description,
    source: { agent, path: filePath, dir },
    version,
    tags,
    raw: data as Record<string, unknown>,
  };
}

export async function scanSkills(extraPaths?: string[]): Promise<ScanResult> {
  const skills: Skill[] = [];
  const errors: { path: string; error: string }[] = [];
  const scannedDirs: string[] = [];
  const seenInodes = new Set<number>();

  // Merge: known agents + user-configured paths + caller-supplied paths
  const userPaths = getExtraPaths();
  const allExtra = [...userPaths, ...(extraPaths ?? [])];

  const sources: AgentSource[] = [...KNOWN_AGENTS];
  if (allExtra.length > 0) {
    sources.push({ name: "extra", paths: allExtra });
  }

  for (const agent of sources) {
    for (const rawDir of agent.paths) {
      const dir = expandHome(rawDir);
      let stat: fs.Stats;
      try {
        stat = fs.statSync(dir);
      } catch {
        continue; // directory doesn't exist, skip silently
      }
      if (!stat.isDirectory()) continue;
      if (seenInodes.has(stat.ino)) continue;
      seenInodes.add(stat.ino);
      scannedDirs.push(dir);

      let files: string[];
      try {
        files = findSkillFiles(dir);
      } catch (e) {
        errors.push({ path: dir, error: String(e) });
        continue;
      }

      for (const file of files) {
        try {
          const skill = parseSkillFile(file, agent.name);
          if (skill) skills.push(skill);
        } catch (e) {
          errors.push({ path: file, error: String(e) });
        }
      }
    }
  }

  return { skills, errors, scannedDirs };
}
