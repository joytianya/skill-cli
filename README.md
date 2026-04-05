<div align="center">

# 🧠 skill-cli

**One command to rule all your AI agent skills.**

Browse, search, and manage skills across Claude, Codex, Gemini, and every other AI tool on your machine — from a single unified CLI.

![demo](demo.gif)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/runtime-bun-black?logo=bun)](https://bun.sh)
[![GitHub](https://img.shields.io/badge/github-joytianya%2Fskill--cli-181717?logo=github)](https://github.com/joytianya/skill-cli)

</div>

---

## ✨ Features

- 🔍 **Unified view** — scan 10+ agent directories in one command
- ⚡ **Fast** — incremental scanning with inode dedup, results in milliseconds
- 🛠️ **Auto-repair** — `doctor --fix` patches broken YAML frontmatter automatically
- 📁 **Extensible** — add any custom directory with `skill paths add`
- 🔒 **Safe** — ANSI injection protection, file size limits, read-only by default

---

## 🤖 Supported Agents

| Agent | Default Skills Path |
|-------|-------------------|
| 🟣 claude | `~/.claude/skills` |
| ⚫ codex | `~/.codex/skills` |
| 🔵 gemini | `~/.gemini/skills` |
| 🟠 openclaw | `~/.openclaw/skills` |
| 🟡 kiro | `~/.kiro/skills` |
| 🟢 opencode | `~/.config/opencode/skills` |
| 🔷 cursor | `~/.cursor/skills` |
| ⬜ qoder | `~/.qoder/skills` |
| 🔴 continue | `~/.continue/skills` |

> Don't see your agent? Use `skill paths add <dir>` to add any directory.

---

## 📦 Installation

**Requirements:** [Bun](https://bun.sh) ≥ 1.0

```bash
git clone https://github.com/joytianya/skill-cli.git
cd skill-cli
bun install
bun link
```

---

## 🚀 Commands

### Browse

| Command | Description |
|---------|-------------|
| `skill list` | List all skills across every agent |
| `skill list --agent <name>` | Filter by agent (`claude`, `codex`, `gemini`…) |
| `skill list --json` | Output raw JSON |
| `skill show <id>` | Show full details for a skill (`claude:browse`) |
| `skill search <query>` | Search by name or description |

### Maintenance

| Command | Description |
|---------|-------------|
| `skill scan` | Re-scan all directories and show updated results |
| `skill scan --agent <name>` | Scan a specific agent only |
| `skill doctor` | Health check — list parse errors and missing dirs |
| `skill doctor --fix` | Auto-repair broken YAML frontmatter |

### Custom Paths

| Command | Description |
|---------|-------------|
| `skill paths add <dir>` | Register a custom scan directory |
| `skill paths remove <dir>` | Remove a custom directory |
| `skill paths list` | Show all registered custom directories |

---

## 📺 Examples

<details>
<summary><b>skill scan</b> — discover all skills</summary>

```
$ skill scan
Scanning agent directories...
✓ Found 144 skills across 14 directories (46ms)

 NAME                     AGENT       VERSION    DESCRIPTION
────────────────────────────────────────────────────────────────────────────
 browse                   claude      -          Fast headless browser for…
 commit                   claude      -          Generate smart git commit…
 image-gen                claude      -          Generate AI images from t…
 paperclip                codex       -          Interact with the Paperc…
 xlsx                     codex       -          Comprehensive spreadsheet…
 chrome-cdp               openclaw    -          Interact with local Chrom…
```

</details>

<details>
<summary><b>skill list --agent codex</b> — filter by agent</summary>

```
$ skill list --agent codex

 NAME                     AGENT    VERSION    DESCRIPTION
────────────────────────────────────────────────────────────────────────────
 paperclip                codex    -          Interact with the Paperclip…
 theme-factory            codex    -          Toolkit for styling artifact…
 xlsx                     codex    -          Comprehensive spreadsheet cr…
 pdf                      codex    -          Comprehensive PDF manipulati…
 skill-creator            codex    -          Guide for creating effective…
```

</details>

<details>
<summary><b>skill search browser</b> — search across all agents</summary>

```
$ skill search browser

 NAME                     AGENT       VERSION    DESCRIPTION
────────────────────────────────────────────────────────────────────────────
 browse                   claude      -          Fast headless browser for…
 gstack                   claude      1.1.0      Fast headless browser for…
 setup-browser-cookies    claude      1.0.0      Import cookies from your…
 webapp-testing           codex       -          Toolkit for interacting w…
 chrome-cdp               openclaw    -          Interact with local Chrom…
```

</details>

<details>
<summary><b>skill doctor --fix</b> — auto-repair broken skills</summary>

```
$ skill doctor
⚠ claude     ~/.claude/skills    64 skills (9 parse errors)
...
Run `skill doctor --fix` to attempt auto-repair.

$ skill doctor --fix
Attempting auto-fix...

  ✓ fixed  ~/.claude/skills/clash-verge/SKILL.md
           cleaned stray lines; backup saved as .bak
  ✓ fixed  ~/.claude/skills/tts/SKILL.md
           cleaned stray lines; backup saved as .bak
  ...

Fixed 9 file(s). Run `skill doctor` to verify.
Original files backed up as <file>.bak
```

</details>

<details>
<summary><b>skill paths</b> — add custom directories</summary>

```
$ skill paths add ~/.myagent/skills
✓ Added: ~/.myagent/skills
Run `skill scan` to see updated results.

$ skill paths list
Custom scan paths:
  ~/.myagent/skills
```

</details>

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — adding a new agent takes one line in `src/agents.ts`.

---

<div align="center">
<sub>Made with ☕ · MIT License</sub>
</div>
