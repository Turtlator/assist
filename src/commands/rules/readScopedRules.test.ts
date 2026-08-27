import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readScopedRules } from "./readScopedRules";

describe("readScopedRules", () => {
	let root: string;

	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), "read-scoped-rules-"));
		mkdirSync(join(root, ".git"), { recursive: true });
	});

	afterEach(() => {
		rmSync(root, { recursive: true, force: true });
	});

	function writeClaudeMd(dir: string, content: string): string {
		const target = join(root, dir);
		mkdirSync(target, { recursive: true });
		const file = join(target, "CLAUDE.md");
		writeFileSync(file, content);
		return file;
	}

	it("collects rules from the nearest CLAUDE.md up to the repo root", () => {
		const rootFile = writeClaudeMd(".", "## Rules\n- **R1** — Root rule\n");
		const nestedFile = writeClaudeMd(
			"refinement",
			"## Rules\n- **R4** — Refinement rule\n",
		);

		expect(readScopedRules(join(root, "refinement", "note.md"))).toEqual([
			{ code: "R4", text: "Refinement rule", source: nestedFile },
			{ code: "R1", text: "Root rule", source: rootFile },
		]);
	});

	it("accepts a directory as the target", () => {
		const rootFile = writeClaudeMd(".", "## Rules\n- **R1** — Root rule\n");

		expect(readScopedRules(join(root, "refinement"))).toEqual([
			{ code: "R1", text: "Root rule", source: rootFile },
		]);
	});

	it("skips directories without a CLAUDE.md and stops at the repo root", () => {
		writeClaudeMd(".", "## Rules\n- **R1** — Root rule\n");
		writeClaudeMd("work/deep", "## Rules\n- **R9** — Deep rule\n");

		const rules = readScopedRules(join(root, "work", "deep", "doc.md"));

		expect(rules.map((rule) => rule.code)).toEqual(["R9", "R1"]);
	});

	it("returns nothing when no CLAUDE.md carries a Rules section", () => {
		writeClaudeMd(".", "# Project\n\nSome guidance.\n");

		expect(readScopedRules(join(root, "doc.md"))).toEqual([]);
	});
});
