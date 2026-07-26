import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readConfigEntries } from "./readConfigEntries";

const root = join(tmpdir(), "assist-read-config-entries-test");
const home = join(root, "home");
const repo = join(root, "repo");
const repoConfig = join(repo, "assist.yml");
const globalConfig = join(home, ".assist.yml");
const repoOriginKey = `local:${repo}`;

mkdirSync(repo, { recursive: true });
mkdirSync(home, { recursive: true });

afterAll(() => {
	vi.unstubAllEnvs();
	rmSync(root, { recursive: true, force: true });
});

function entryFor(key: string) {
	const entry = readConfigEntries(repo).find((e) => e.key === key);
	if (!entry) throw new Error(`no entry for ${key}`);
	return entry;
}

describe("readConfigEntries", () => {
	beforeEach(() => {
		vi.stubEnv("HOME", home);
		writeFileSync(repoConfig, "");
		writeFileSync(globalConfig, "");
	});

	it("attributes a key set in the repo's assist.yml to the project", () => {
		writeFileSync(repoConfig, "commit:\n  push: true\n");

		expect(entryFor("commit.push")).toMatchObject({
			value: true,
			source: "project",
		});
	});

	it("attributes a key set only in the global config to global", () => {
		writeFileSync(globalConfig, "backup:\n  dir: ~/elsewhere\n");

		expect(entryFor("backup.dir")).toMatchObject({
			value: "~/elsewhere",
			source: "global",
		});
	});

	it("prefers the project value when both files set the key", () => {
		writeFileSync(globalConfig, "commit:\n  push: false\n");
		writeFileSync(repoConfig, "commit:\n  push: true\n");

		expect(entryFor("commit.push")).toMatchObject({
			value: true,
			source: "project",
		});
	});

	it("marks an unset key as coming from the schema default", () => {
		const entry = entryFor("commit.push");

		expect(entry.source).toBe("default");
		expect(entry.value).toBe(false);
	});

	it("flags global-only keys and leaves the rest unflagged", () => {
		expect(entryFor("sync.autoConfirm").globalOnly).toBe(true);
		expect(entryFor("commit.push").globalOnly).toBe(false);
	});

	it("carries a descriptor node for every leaf", () => {
		expect(entryFor("sql.connections").node).toMatchObject({
			kind: "objectList",
			item: { kind: "object" },
		});
		expect(entryFor("cliReadVerbs").node).toMatchObject({ kind: "record" });
		expect(entryFor("run").node).toMatchObject({
			kind: "objectList",
			item: { kind: "unionOfObjects" },
		});
		expect(entryFor("commit.push").node).toMatchObject({
			kind: "scalar",
			type: "boolean",
		});
	});

	it("keeps global siblings when a repos override sets one nested key", () => {
		writeFileSync(
			globalConfig,
			`repos:\n  "${repoOriginKey}":\n    worktree:\n      enabled: true\nworktree:\n  trunk: true\n`,
		);

		expect(entryFor("worktree.trunk")).toMatchObject({
			value: true,
			source: "global",
		});
		expect(entryFor("worktree.enabled")).toMatchObject({
			value: true,
			source: "repo",
			repoKey: repoOriginKey,
		});
	});

	it("names the matching repos key on keys the override does not set", () => {
		writeFileSync(
			globalConfig,
			`repos:\n  "${repoOriginKey}":\n    worktree:\n      enabled: true\n`,
		);

		expect(entryFor("commit.push")).toMatchObject({
			source: "default",
			repoKey: repoOriginKey,
		});
	});

	it("leaves repoKey unset when no repos entry matches the repo", () => {
		writeFileSync(
			globalConfig,
			"repos:\n  other/repo:\n    commit:\n      push: true\n",
		);

		expect(entryFor("commit.push").repoKey).toBeUndefined();
	});

	it("prefers the project value over a repos override", () => {
		writeFileSync(
			globalConfig,
			`repos:\n  "${repoOriginKey}":\n    commit:\n      push: false\n`,
		);
		writeFileSync(repoConfig, "commit:\n  push: true\n");

		expect(entryFor("commit.push")).toMatchObject({
			value: true,
			source: "project",
			sources: ["project", "repo"],
		});
	});

	it("lists every layer that sets the key", () => {
		writeFileSync(globalConfig, "commit:\n  push: false\n");
		writeFileSync(repoConfig, "commit:\n  push: true\n");

		expect(entryFor("commit.push").sources).toEqual(["project", "global"]);
		expect(entryFor("worktree.trunk").sources).toEqual([]);
	});

	it("reports the schema default for a leaf under an unset optional parent", () => {
		const entry = entryFor("worktree.enabled");

		expect(entry.source).toBe("default");
		expect(entry.value).toBeUndefined();
		expect(entry.defaultValue).toBe(false);
	});
});
