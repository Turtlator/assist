import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { parse, stringify } from "yaml";
import type { MiroExtractConfig } from "../../shared/types";
import { saveMiroExtract } from "./saveMiroExtract";
import type { MiroExtractOptions } from "./types";

let dir: string;
let globalConfigPath: string;

const epics: MiroExtractConfig = {
	board: "uXjVGqQsR5Q=",
	frame: "3458764665701555761",
	topLeft: "3458764680658544387",
	bottomRight: "3458764680658544425",
	items: "board-items.json",
	out: "epics.yml",
};

function projectConfigPath(): string {
	return join(dir, "assist.yml");
}

function read(path: string): Record<string, unknown> {
	return parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function save(options: MiroExtractOptions, name = "epics") {
	return saveMiroExtract(name, epics, options, { cwd: dir, globalConfigPath });
}

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "miro-save-"));
	globalConfigPath = join(dir, "global.yml");
	writeFileSync(globalConfigPath, stringify({}));
	writeFileSync(projectConfigPath(), stringify({}));
});

describe("saveMiroExtract", () => {
	describe("with no scope flags", () => {
		it("should write the project config and report its path", () => {
			expect(save({})).toBe(projectConfigPath());
			expect(read(projectConfigPath())).toEqual({
				miro: { extracts: { epics } },
			});
		});

		it("should leave the global config alone", () => {
			save({});

			expect(read(globalConfigPath)).toEqual({});
		});

		it("should keep extracts already saved", () => {
			writeFileSync(
				projectConfigPath(),
				stringify({ miro: { extracts: { risks: epics } } }),
			);

			save({});

			expect(Object.keys(read(projectConfigPath()).miro as object)).toEqual([
				"extracts",
			]);
			expect(
				Object.keys(
					(read(projectConfigPath()).miro as { extracts: object }).extracts,
				),
			).toEqual(["risks", "epics"]);
		});
	});

	describe("with --global", () => {
		it("should write the global config and report its path", () => {
			expect(save({ global: true })).toBe(globalConfigPath);
			expect(read(globalConfigPath)).toEqual({ miro: { extracts: { epics } } });
			expect(read(projectConfigPath())).toEqual({});
		});
	});

	describe("with --global --repo", () => {
		it("should write under the current repo's key in the global config", () => {
			const path = save({ global: true, repo: true });

			const repos = read(globalConfigPath).repos as Record<string, unknown>;
			const label = Object.keys(repos)[0];
			expect(path).toBe(`${globalConfigPath} under repos.${label}`);
			expect(repos[label]).toEqual({ miro: { extracts: { epics } } });
			expect(read(projectConfigPath())).toEqual({});
		});
	});

	describe("with --global --repo <name>", () => {
		it("should write under that repo's key", () => {
			writeFileSync(
				globalConfigPath,
				stringify({ repos: { "github.com/org/other": {} } }),
			);

			const path = save({ global: true, repo: "github.com/org/other" });

			expect(path).toBe(`${globalConfigPath} under repos.github.com/org/other`);
			expect(read(globalConfigPath)).toEqual({
				repos: { "github.com/org/other": { miro: { extracts: { epics } } } },
			});
		});
	});

	describe("with --repo but no --global", () => {
		it("should refuse, naming the flag to add", () => {
			expect(() => save({ repo: true })).toThrow(
				/--repo writes to the global config; add -g/,
			);
		});
	});
});
