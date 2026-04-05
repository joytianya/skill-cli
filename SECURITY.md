# Security

## Security Measures

### ANSI / Terminal Injection (scanner.ts)
Skill frontmatter fields (`name`, `description`, `version`, `tags`) are sanitized via `sanitize()` to strip ANSI escape sequences and C0/C1 control characters before any output. A malicious `skill.md` cannot inject terminal control sequences.

### Recursion Depth Limit (scanner.ts)
`findSkillFiles` is capped at `MAX_SCAN_DEPTH = 10` to prevent stack overflow on adversarially deep directory trees.

### Tags Type Validation (scanner.ts)
`tags` array elements are filtered to strings only before use, preventing runtime errors from non-string YAML values.

### File Size Limit (scanner.ts)
`parseSkillFile` skips files larger than 1 MB (`MAX_FILE_SIZE`) to prevent OOM on oversized files. Skipped files are silently ignored (not added to errors).

### Path Prefix Matching (doctor.ts)
Error attribution uses `e.path === d || e.path.startsWith(d + path.sep)` to avoid false matches where one agent path is a prefix of another (e.g. `/home/user/foo` vs `/home/user/foobar`).

### JSON Serialization Error (list.ts)
`JSON.stringify` is wrapped in try-catch. Circular references in `raw` frontmatter data (theoretically possible with malicious YAML) will produce a clean error message instead of an unhandled exception.

### Unhandled Promise Rejections (cli.ts)
A global `unhandledRejection` handler ensures any async command failure produces a clean error message and non-zero exit code.

## Known Design Limitations

### `raw` Field Exposed in `--json` Output
`skill list --json` outputs the full `raw` frontmatter object for each skill. If a `skill.md` contains sensitive key-value pairs in its frontmatter, they will appear in JSON output. This is intentional for power users but worth noting.

### Symlinks Inside Skill Directories Not Followed
`fs.Dirent.isDirectory()` and `isFile()` do not follow symlinks. Symlinks to skill files or subdirectories inside a scanned directory will be silently ignored. This is safe but means skills accessed via symlinks won't be discovered.

### Path Traversal via `..` in Skill Names
A `name` field containing `..` (e.g. `name: "../../etc/passwd"`) is used in the skill `id` but never used to construct file paths, so there is no actual path traversal risk. The sanitized name will appear in output but cannot access files outside the scanned directories.

## Reporting Vulnerabilities

Please open an issue at https://github.com/joytianya/skill-cli/issues to report security concerns.
