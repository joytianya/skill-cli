# skill-cli

A CLI tool to uniformly manage AI agent skills across all local AI agents.

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
| `skill show <name>` | Show details of a specific skill |
| `skill search <query>` | Search skills by name or description |
| `skill scan` | Scan all agent skill directories |
| `skill doctor` | Check agent skill directory health |

## Example

```
$ skill list
┌─────────────────┬─────────┬──────────────────────────────────┐
│ Name            │ Agent   │ Description                      │
├─────────────────┼─────────┼──────────────────────────────────┤
│ browse          │ claude  │ Fast headless browser for QA     │
│ commit          │ claude  │ Smart git commit helper          │
│ codex           │ codex   │ OpenAI Codex CLI wrapper         │
└─────────────────┴─────────┴──────────────────────────────────┘

$ skill search browser
Found 2 skills matching "browser"...

$ skill doctor
✓ claude  ~/.claude/skills  (12 skills)
✗ codex   ~/.codex/skills   (not found)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
