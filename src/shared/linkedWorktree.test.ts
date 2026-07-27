import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { linkedWorktree } from "./linkedWorktree";

let base: string;

function makeClone(name = "repo"): string {
	const clone = join(base, name);
	mkdirSync(join(clone, ".git"), { recursive: true });
	return clone;
}

function makeWorktree(
	clone: string,
	name: string,
	{ commondir = true } = {},
): string {
	const gitDir = join(clone, ".git", "worktrees", name);
	mkdirSync(gitDir, { recursive: true });
	if (commondir) writeFileSync(join(gitDir, "commondir"), "../..\n");
	const root = join(base, name);
	mkdirSync(root, { recursive: true });
	writeFileSync(join(root, ".git"), `gitdir: ${gitDir}\n`);
	return root;
}

describe("linkedWorktree", () => {
	beforeEach(() => {
		base = mkdtempSync(join(tmpdir(), "linked-worktree-"));
	});

	afterEach(() => {
		rmSync(base, { recursive: true, force: true });
	});

	it("resolves the clone from a worktree root", () => {
		const clone = makeClone();
		const root = makeWorktree(clone, "repo-2");

		expect(linkedWorktree(root)).toEqual({ root, clone });
	});

	it("resolves the clone from a directory inside the worktree", () => {
		const clone = makeClone();
		const root = makeWorktree(clone, "repo-2");
		const nested = join(root, "src", "commands");
		mkdirSync(nested, { recursive: true });

		expect(linkedWorktree(nested)?.clone).toBe(clone);
	});

	it("falls back to the gitdir layout when commondir is absent", () => {
		const clone = makeClone();
		const root = makeWorktree(clone, "repo-3", { commondir: false });

		expect(linkedWorktree(root)).toEqual({ root, clone });
	});

	it("returns null for the clone itself", () => {
		const clone = makeClone();

		expect(linkedWorktree(clone)).toBeNull();
	});

	it("returns null outside any repository", () => {
		const loose = join(base, "loose");
		mkdirSync(loose, { recursive: true });

		expect(linkedWorktree(loose)).toBeNull();
	});

	it("returns null for a submodule, whose gitdir is not a worktree", () => {
		const clone = makeClone();
		const submodule = join(clone, "vendor", "lib");
		mkdirSync(join(clone, ".git", "modules", "lib"), { recursive: true });
		mkdirSync(submodule, { recursive: true });
		writeFileSync(
			join(submodule, ".git"),
			`gitdir: ${join(clone, ".git", "modules", "lib")}\n`,
		);

		expect(linkedWorktree(submodule)).toBeNull();
	});
});
