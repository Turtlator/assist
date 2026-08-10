import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getStoreDir, loadJson, saveJson } from "./loadJson";

const original = process.env.ASSIST_STORE_DIR;
const dirs: string[] = [];

afterEach(() => {
	process.env.ASSIST_STORE_DIR = original;
	for (const dir of dirs.splice(0))
		rmSync(dir, { recursive: true, force: true });
});

function tempStore(): string {
	const dir = mkdtempSync(join(tmpdir(), "loadjson-"));
	dirs.push(dir);
	process.env.ASSIST_STORE_DIR = dir;
	return dir;
}

describe("the assist store directory", () => {
	it("writes into the directory named by ASSIST_STORE_DIR", () => {
		const dir = tempStore();

		saveJson("worktrees.json", { "/git/repo-2": { clone: "/git/repo" } });

		expect(existsSync(join(dir, "worktrees.json"))).toBe(true);
		expect(loadJson("worktrees.json")).toEqual({
			"/git/repo-2": { clone: "/git/repo" },
		});
	});

	it("falls back to the home directory when the override is unset", () => {
		delete process.env.ASSIST_STORE_DIR;

		expect(getStoreDir()).toBe(join(homedir(), ".assist"));
	});
});
