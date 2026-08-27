import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addRule } from "./addRule";
import { readScopedRules } from "./readScopedRules";

describe("addRule", () => {
	let root: string;

	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), "add-rule-"));
		mkdirSync(join(root, ".git"), { recursive: true });
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		rmSync(root, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	function writeClaudeMd(dir: string, content: string): string {
		const target = join(root, dir);
		mkdirSync(target, { recursive: true });
		const file = join(target, "CLAUDE.md");
		writeFileSync(file, content);
		return file;
	}

	it("writes into the nearest CLAUDE.md and allocates the next repo-wide code", () => {
		writeClaudeMd(".", "## Rules\n\n- **R1** — Root rule\n");
		const nested = writeClaudeMd(
			"refinement",
			"## Rules\n\n- **R4** — Refinement rule\n",
		);

		addRule("Keep it tight", { scope: join(root, "refinement", "note.md") });

		expect(readFileSync(nested, "utf8")).toBe(
			"## Rules\n\n- **R4** — Refinement rule\n- **R5** — Keep it tight\n",
		);
	});

	it("records the scoped directories in the root CLAUDE.md", () => {
		const rootFile = writeClaudeMd(".", "## Rules\n\n- **R1** — Root rule\n");
		mkdirSync(join(root, "work"), { recursive: true });

		addRule("Log every decision", { scope: join(root, "work", "CLAUDE.md") });

		expect(readFileSync(rootFile, "utf8")).toBe(
			"## Rules\n\n- **R1** — Root rule\n\nDirectories with their own `## Rules`: `work/`\n",
		);
	});

	it("creates the Rules section when the scope has none", () => {
		const rootFile = writeClaudeMd(".", "# Project\n\nGuidance.\n");

		addRule("Prefer short sentences", { scope: root });

		expect(readFileSync(rootFile, "utf8")).toBe(
			"# Project\n\nGuidance.\n\n## Rules\n\n- **R1** — Prefer short sentences\n",
		);
	});

	it("adds a rule the scoped reader can then find", () => {
		writeClaudeMd(".", "## Rules\n\n- **R1** — Root rule\n");
		mkdirSync(join(root, "work"), { recursive: true });

		addRule("Log every decision", { scope: join(root, "work", "CLAUDE.md") });

		expect(readScopedRules(join(root, "work", "note.md"))).toEqual([
			{
				code: "R2",
				text: "Log every decision",
				source: join(root, "work", "CLAUDE.md"),
			},
			{ code: "R1", text: "Root rule", source: join(root, "CLAUDE.md") },
		]);
	});
});
