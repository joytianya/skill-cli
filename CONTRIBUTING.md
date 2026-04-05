# Contributing

## Adding a New Agent

Edit `src/agents.ts` and add an entry to `KNOWN_AGENTS`:

```ts
{
  name: "your-agent",
  paths: [`${home}/.your-agent/skills`],
  skillFilePattern: "**/SKILL.md",
}
```

## Running Tests

```bash
bun test
```

## Pull Requests

1. Fork the repo and create a branch
2. Make your changes
3. Run `bun test` to verify
4. Open a PR with a clear description
