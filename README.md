# skill-cli

A unified CLI to browse and manage AI agent skills across all local AI tools — Claude, Codex, Gemini, and more.

![demo](demo.gif)


## Supported Agents

| Agent | Skills Path |
|-------|-------------|
| claude | `~/.claude/skills` |
| codex | `~/.codex/skills` |
| gemini | `~/.gemini/skills` |
| openclaw | `~/.openclaw/skills` |
| kiro | `~/.kiro/skills` |
| opencode | `~/.config/opencode/skills` |
| cursor | `~/.cursor/skills` |
| qoder | `~/.qoder/skills` |
| continue | `~/.continue/skills` |

## Installation

```bash
bun link
```

## Commands

| Command | Description |
|---------|-------------|
| `skill list` | List all skills across all agents |
| `skill list --agent <name>` | Filter by agent (claude, codex, gemini…) |
| `skill show <id>` | Show full details of a skill |
| `skill search <query>` | Search skills by name or description |
| `skill scan` | Re-scan all directories and show results |
| `skill doctor` | Health check for all agent skill directories |
| `skill paths add <dir>` | Add a custom scan directory |
| `skill paths remove <dir>` | Remove a custom scan directory |
| `skill paths list` | List custom scan directories |

## Demo

### `skill scan` — discover all skills

```
$ skill scan
Scanning agent directories...
✓ Found 135 skills across 14 directories (46ms)
⚠ 9 parse error(s) — run `skill doctor` for details

 NAME                     AGENT       VERSION    DESCRIPTION
────────────────────────────────────────────────────────────────────────────
 browse                   claude      -          Fast headless browser for…
 commit                   claude      -          Generate smart git commit…
 image-gen                claude      -          Generate AI images from t…
 paperclip                codex       -          Interact with the Paperc…
 xlsx                     codex       -          Comprehensive spreadsheet…
 chrome-cdp               openclaw    -          Interact with local Chrom…
 ...
```

### `skill list --agent codex` — filter by agent

```
$ skill list --agent codex

 NAME                     AGENT    VERSION    DESCRIPTION
────────────────────────────────────────────────────────────────────────────
 paperclip                codex    -          Interact with the Paperclip…
 theme-factory            codex    -          Toolkit for styling artifact…
 doc-coauthoring          codex    -          Guide users through a struct…
 xlsx                     codex    -          Comprehensive spreadsheet cr…
 pdf                      codex    -          Comprehensive PDF manipulati…
 algorithmic-art          codex    -          Creating algorithmic art usi…
 skill-creator            codex    -          Guide for creating effective…
```

### `skill search browser` — search across all agents

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

### `skill doctor` — health check

```
$ skill doctor
Scanned 14 directories, found 135 skills

⚠ claude     ~/.claude/skills               64 skills (9 parse errors)
✓ codex      ~/.codex/skills                22 skills
✓ gemini     ~/.gemini/skills               0 skills
✓ openclaw   ~/.openclaw/skills             14 skills
✓ kiro       ~/.kiro/skills                 0 skills
✓ opencode   ~/.config/opencode/skills      14 skills
✓ agents     ~/.agents/skills               21 skills
```

### `skill paths` — add custom directories

```
$ skill paths add ~/.myagent/skills
✓ Added: ~/.myagent/skills
Run `skill scan` to see updated results.

$ skill paths list
Custom scan paths:
  ~/.myagent/skills
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
