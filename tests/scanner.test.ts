import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import fs from "fs";
import path from "path";
import os from "os";
import { scanSkills } from "../src/scanner.js";

// Helper: create a temp directory tree
function mkdirp(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function writeSkill(dir: string, frontmatter: Record<string, unknown>, body = "") {
  const fm = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("\n");
  const content = `---\n${fm}\n---\n${body}`;
  fs.writeFileSync(path.join(dir, "SKILL.md"), content, "utf-8");
}

// Filter to only skills from the "extra" agent (our test paths)
function extraSkills(result: Awaited<ReturnType<typeof scanSkills>>) {
  return result.skills.filter((s) => s.source.agent === "extra");
}

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "skill-cli-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("scanSkills", () => {
  describe("basic scanning", () => {
    it("returns no extra skills when no skill files exist", async () => {
      const result = await scanSkills([tmpDir]);
      expect(extraSkills(result)).toHaveLength(0);
      // No errors from our test path
      const extraErrors = result.errors.filter((e) => e.path.startsWith(tmpDir));
      expect(extraErrors).toHaveLength(0);
      expect(result.scannedDirs).toContain(tmpDir);
    });

    it("finds a SKILL.md in the root of the extra path", async () => {
      writeSkill(tmpDir, { name: "my-skill", description: "A test skill" });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills).toHaveLength(1);
      expect(skills[0].name).toBe("my-skill");
      expect(skills[0].description).toBe("A test skill");
    });

    it("finds SKILL.md files in nested subdirectories", async () => {
      const sub = path.join(tmpDir, "nested", "deep");
      mkdirp(sub);
      writeSkill(sub, { name: "nested-skill", description: "Nested" });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills).toHaveLength(1);
      expect(skills[0].name).toBe("nested-skill");
    });

    it("finds multiple skills across different subdirectories", async () => {
      const a = path.join(tmpDir, "skill-a");
      const b = path.join(tmpDir, "skill-b");
      mkdirp(a);
      mkdirp(b);
      writeSkill(a, { name: "skill-a", description: "A" });
      writeSkill(b, { name: "skill-b", description: "B" });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills).toHaveLength(2);
      const names = skills.map((s) => s.name).sort();
      expect(names).toEqual(["skill-a", "skill-b"]);
    });
  });

  describe("skill parsing", () => {
    it("uses directory name as skill name when frontmatter name is missing", async () => {
      const skillDir = path.join(tmpDir, "my-dir-skill");
      mkdirp(skillDir);
      writeSkill(skillDir, { description: "No name in frontmatter" });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills[0].name).toBe("my-dir-skill");
    });

    it("uses directory name as skill name when frontmatter name is empty string", async () => {
      const skillDir = path.join(tmpDir, "fallback-skill");
      mkdirp(skillDir);
      writeSkill(skillDir, { name: "", description: "Empty name" });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills[0].name).toBe("fallback-skill");
    });

    it("sets id as agent:name", async () => {
      writeSkill(tmpDir, { name: "test-skill" });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills[0].id).toBe("extra:test-skill");
    });

    it("parses optional version field", async () => {
      writeSkill(tmpDir, { name: "versioned", version: "1.2.3" });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills[0].version).toBe("1.2.3");
    });

    it("leaves version undefined when not present", async () => {
      writeSkill(tmpDir, { name: "no-version" });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills[0].version).toBeUndefined();
    });

    it("parses optional tags array", async () => {
      writeSkill(tmpDir, { name: "tagged", tags: ["ai", "search"] });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills[0].tags).toEqual(["ai", "search"]);
    });

    it("leaves tags undefined when not present", async () => {
      writeSkill(tmpDir, { name: "no-tags" });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills[0].tags).toBeUndefined();
    });

    it("leaves tags undefined when tags is not an array", async () => {
      writeSkill(tmpDir, { name: "bad-tags", tags: "not-an-array" });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills[0].tags).toBeUndefined();
    });

    it("sets source.agent to 'extra' for extra paths", async () => {
      writeSkill(tmpDir, { name: "src-test" });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills[0].source.agent).toBe("extra");
    });

    it("sets source.path to the SKILL.md file path", async () => {
      writeSkill(tmpDir, { name: "path-test" });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills[0].source.path).toBe(path.join(tmpDir, "SKILL.md"));
    });

    it("sets source.dir to the directory containing SKILL.md", async () => {
      writeSkill(tmpDir, { name: "dir-test" });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills[0].source.dir).toBe(tmpDir);
    });

    it("stores raw frontmatter data", async () => {
      writeSkill(tmpDir, { name: "raw-test", custom: "value", count: 42 });
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills[0].raw.custom).toBe("value");
      expect(skills[0].raw.count).toBe(42);
    });

    it("handles SKILL.md with no frontmatter gracefully", async () => {
      fs.writeFileSync(path.join(tmpDir, "SKILL.md"), "# Just a heading\nNo frontmatter here.", "utf-8");
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      // Should still produce a skill using dir name
      expect(skills).toHaveLength(1);
      expect(skills[0].name).toBe(path.basename(tmpDir));
    });

    it("handles SKILL.md with empty content", async () => {
      fs.writeFileSync(path.join(tmpDir, "SKILL.md"), "", "utf-8");
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills).toHaveLength(1);
    });
  });

  describe("deduplication via inode", () => {
    it("does not scan the same directory twice (symlink dedup)", async () => {
      writeSkill(tmpDir, { name: "dedup-skill" });
      // Pass the same path twice
      const result = await scanSkills([tmpDir, tmpDir]);
      const skills = extraSkills(result);
      expect(skills).toHaveLength(1);
    });
  });

  describe("error handling", () => {
    it("skips non-existent extra paths silently", async () => {
      const nonExistent = path.join(tmpDir, "does-not-exist");
      const result = await scanSkills([nonExistent]);
      expect(extraSkills(result)).toHaveLength(0);
      const extraErrors = result.errors.filter((e) => e.path.startsWith(tmpDir));
      expect(extraErrors).toHaveLength(0);
      expect(result.scannedDirs).not.toContain(nonExistent);
    });

    it("skips paths that are files, not directories", async () => {
      const filePath = path.join(tmpDir, "a-file.txt");
      fs.writeFileSync(filePath, "hello");
      const result = await scanSkills([filePath]);
      expect(extraSkills(result)).toHaveLength(0);
      const extraErrors = result.errors.filter((e) => e.path.startsWith(tmpDir));
      expect(extraErrors).toHaveLength(0);
    });

    it("returns valid result structure when extraPaths is undefined", async () => {
      const result = await scanSkills(undefined);
      expect(result).toHaveProperty("skills");
      expect(result).toHaveProperty("errors");
      expect(result).toHaveProperty("scannedDirs");
      expect(Array.isArray(result.skills)).toBe(true);
    });

    it("returns valid result structure when extraPaths is empty array", async () => {
      const result = await scanSkills([]);
      expect(result).toHaveProperty("skills");
      expect(Array.isArray(result.skills)).toBe(true);
    });
  });

  describe("home directory expansion", () => {
    it("expands ~ in paths and skips non-existent gracefully", async () => {
      const result = await scanSkills(["~/nonexistent-skill-cli-test-dir-xyz"]);
      expect(extraSkills(result)).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("case insensitivity for skill.md", () => {
    it("finds skill.md (lowercase) as well as SKILL.md", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "skill.md"),
        "---\nname: \"lowercase-skill\"\n---\n",
        "utf-8"
      );
      const result = await scanSkills([tmpDir]);
      const skills = extraSkills(result);
      expect(skills).toHaveLength(1);
      expect(skills[0].name).toBe("lowercase-skill");
    });
  });

  describe("scannedDirs tracking", () => {
    it("includes the scanned directory in scannedDirs", async () => {
      const result = await scanSkills([tmpDir]);
      expect(result.scannedDirs).toContain(tmpDir);
    });

    it("does not include non-existent directories in scannedDirs", async () => {
      const nonExistent = path.join(tmpDir, "ghost");
      const result = await scanSkills([nonExistent]);
      expect(result.scannedDirs).not.toContain(nonExistent);
    });
  });
});
