import os from "os";
import type { AgentSource } from "./types.js";

const home = os.homedir();

export const KNOWN_AGENTS: AgentSource[] = [
  { name: "claude", paths: [`${home}/.claude/skills`] },
  { name: "codex", paths: [`${home}/.codex/skills`] },
  { name: "gemini", paths: [`${home}/.gemini/skills`] },
  { name: "openclaw", paths: [`${home}/.openclaw/skills`] },
  { name: "kiro", paths: [`${home}/.kiro/skills`] },
  { name: "opencode", paths: [`${home}/.config/opencode/skills`] },
  { name: "cursor", paths: [`${home}/.cursor/skills`] },
  {
    name: "agents",
    paths: [
      `${home}/.agents/skills`,
      `${home}/.agents/.claude/skills`,
      `${home}/.agents/.codex/skills`,
      `${home}/.agents/.gemini/skills`,
      `${home}/.agents/.kiro/skills`,
    ],
  },
  { name: "qoder", paths: [`${home}/.qoder/skills`] },
  { name: "continue", paths: [`${home}/.continue/skills`] },
];
