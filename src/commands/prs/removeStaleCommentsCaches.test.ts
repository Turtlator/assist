import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { removeStaleCommentsCaches } from "./removeStaleCommentsCaches";

function seedRepo(...files: string[]): string {
	const cwd = mkdtempSync(join(tmpdir(), "stale-comments-cache-"));
	mkdirSync(join(cwd, ".assist"), { recursive: true });
	for (const file of files) {
		writeFileSync(join(cwd, ".assist", file), "prNumber: 1\n");
	}
	return cwd;
}

describe("removeStaleCommentsCaches", () => {
	it("removes repo-level pr comment caches", () => {
		const cwd = seedRepo("pr-1-comments.yaml", "pr-234-comments.yaml");

		removeStaleCommentsCaches(cwd);

		expect(existsSync(join(cwd, ".assist", "pr-1-comments.yaml"))).toBe(false);
		expect(existsSync(join(cwd, ".assist", "pr-234-comments.yaml"))).toBe(
			false,
		);
	});

	it("leaves other files in the repo-level .assist dir alone", () => {
		const cwd = seedRepo(
			"pr-1-comments.yaml",
			"HANDOVER.md",
			"backlog.db",
			"pr-comments.yaml",
		);

		removeStaleCommentsCaches(cwd);

		expect(readdirSync(join(cwd, ".assist")).sort()).toEqual([
			"HANDOVER.md",
			"backlog.db",
			"pr-comments.yaml",
		]);
	});

	it("does nothing when there are no stale files", () => {
		const cwd = seedRepo();

		expect(() => removeStaleCommentsCaches(cwd)).not.toThrow();
		expect(readdirSync(join(cwd, ".assist"))).toEqual([]);
	});

	it("does nothing when there is no repo-level .assist dir", () => {
		const cwd = mkdtempSync(join(tmpdir(), "stale-comments-cache-none-"));

		expect(() => removeStaleCommentsCaches(cwd)).not.toThrow();
		expect(existsSync(join(cwd, ".assist"))).toBe(false);
	});
});
