import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { stringify as stringifyYaml } from "yaml";
import { resolveRunConfigs } from "./resolveRunConfigs";
import { runConfigBaseDirFrom } from "./runConfigBaseDir";
import type { RunEntry } from "./types";

let repo: string;

function makeRepo(): string {
	const dir = mkdtempSync(join(tmpdir(), "run-base-"));
	mkdirSync(join(dir, ".git"));
	mkdirSync(join(dir, "graphql"));
	mkdirSync(join(dir, "src"));
	return dir;
}

beforeEach(() => {
	repo = makeRepo();
});

afterEach(() => {
	rmSync(repo, { recursive: true, force: true });
});

describe("runConfigBaseDirFrom", () => {
	it("is the repo root when the repo has no project config", () => {
		expect(runConfigBaseDirFrom(repo)).toBe(repo);
		expect(runConfigBaseDirFrom(join(repo, "src"))).toBe(repo);
	});

	it("is the repo root for a root assist.yml", () => {
		writeFileSync(join(repo, "assist.yml"), stringifyYaml({ run: [] }));

		expect(runConfigBaseDirFrom(repo)).toBe(repo);
		expect(runConfigBaseDirFrom(join(repo, "src"))).toBe(repo);
	});

	it("is the repo root for a .claude/assist.yml", () => {
		mkdirSync(join(repo, ".claude"));
		writeFileSync(
			join(repo, ".claude", "assist.yml"),
			stringifyYaml({ run: [] }),
		);

		expect(runConfigBaseDirFrom(repo)).toBe(repo);
	});
});

describe("relative run cwd resolution", () => {
	const entries: RunEntry[] = [
		{ name: "start", command: "npm", args: ["run", "start"], cwd: "graphql" },
	];

	function resolvedCwd(from: string): string {
		const base = runConfigBaseDirFrom(from);
		const configs = resolveRunConfigs(entries, base);
		return resolve(base, configs[0].cwd ?? "");
	}

	it("resolves a repos-override entry against the repo root with no project config", () => {
		expect(resolvedCwd(repo)).toBe(join(repo, "graphql"));
	});

	it("resolves to the same directory once the repo gains a project config", () => {
		const withoutConfig = resolvedCwd(repo);
		mkdirSync(join(repo, ".claude"));
		writeFileSync(
			join(repo, ".claude", "assist.yml"),
			stringifyYaml({ run: entries }),
		);

		expect(resolvedCwd(repo)).toBe(withoutConfig);

		rmSync(join(repo, ".claude"), { recursive: true, force: true });
		writeFileSync(join(repo, "assist.yml"), stringifyYaml({ run: entries }));

		expect(resolvedCwd(repo)).toBe(withoutConfig);
	});
});
