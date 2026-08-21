import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { stringify } from "yaml";
import { resolveMiroExtract } from "./resolveMiroExtract";
import type { MiroExtractOptions } from "./types";

let dir: string;
let globalConfigPath: string;

function projectConfig(config: Record<string, unknown>): void {
	writeFileSync(join(dir, "assist.yml"), stringify(config));
}

function globalConfig(config: Record<string, unknown>): void {
	writeFileSync(globalConfigPath, stringify(config));
}

function run(name: string, flags: MiroExtractOptions = {}) {
	return resolveMiroExtract(name, flags, dir, globalConfigPath);
}

const epics = {
	board: "uXjVGqQsR5Q=",
	frame: "3458764665701555761",
	topLeft: "3458764680658544387",
	bottomRight: "3458764680658544425",
	items: "board-items.json",
	ignore: "ignore.yml",
	out: "epics.yml",
};

function extracts(entries: Record<string, unknown>): Record<string, unknown> {
	return { miro: { extracts: entries } };
}

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "miro-config-"));
	globalConfigPath = join(dir, "global.yml");
	globalConfig({});
});

describe("resolveMiroExtract", () => {
	describe("when the extract is in the project config", () => {
		it("should resolve every field, taking paths from the repo root", () => {
			projectConfig(extracts({ epics }));

			expect(run("epics").options).toEqual({
				board: "uXjVGqQsR5Q=",
				frame: "3458764665701555761",
				topLeft: "3458764680658544387",
				bottomRight: "3458764680658544425",
				items: join(dir, "board-items.json"),
				ignore: join(dir, "ignore.yml"),
				out: join(dir, "epics.yml"),
			});
		});

		it("should report the config file it came from", () => {
			projectConfig(extracts({ epics }));

			expect(run("epics").from).toBe(join(dir, "assist.yml"));
		});
	});

	describe("when a flag is given as well", () => {
		it("should override only that field", () => {
			projectConfig(extracts({ epics }));

			const options = run("epics", {
				out: "other.yml",
				topLeft: "999",
			}).options;

			expect(options.out).toBe("other.yml");
			expect(options.topLeft).toBe("999");
			expect(options.bottomRight).toBe(epics.bottomRight);
			expect(options.items).toBe(join(dir, "board-items.json"));
		});
	});

	describe("when the extract is in the global config", () => {
		it("should report the global file", () => {
			projectConfig({});
			globalConfig(extracts({ epics }));

			expect(run("epics").from).toBe(globalConfigPath);
		});
	});

	describe("when the extract is under a repos block", () => {
		it("should report the repos key it came from", () => {
			projectConfig({});
			globalConfig({ repos: { [`local:${dir}`]: extracts({ epics }) } });

			expect(run("epics").from).toBe(
				`${globalConfigPath} under repos.local:${dir}`,
			);
		});
	});

	describe("when two layers define the same extract", () => {
		it("should merge them, preferring the project, and name both files", () => {
			globalConfig(extracts({ epics }));
			projectConfig(extracts({ epics: { out: "project.yml" } }));

			const resolved = run("epics");

			expect(resolved.options.out).toBe(join(dir, "project.yml"));
			expect(resolved.options.items).toBe(join(dir, "board-items.json"));
			expect(resolved.from).toBe(
				`${join(dir, "assist.yml")} merged with ${globalConfigPath}`,
			);
		});
	});

	describe("when the name is not configured", () => {
		it("should list the configured names", () => {
			projectConfig(extracts({ epics, risks: epics }));

			expect(() => run("themes")).toThrow(
				/No extract named "themes" is configured\. Configured extracts: epics, risks\./,
			);
		});

		it("should say how to save one when none are configured", () => {
			projectConfig({});

			expect(() => run("epics")).toThrow(
				/No extract named "epics" is configured\. Pick a rectangle with no anchor flags/,
			);
		});
	});

	describe("when the configured extract is incomplete", () => {
		it("should name the invalid field", () => {
			projectConfig(extracts({ epics: { topLeft: "a", bottomRight: "b" } }));

			expect(() => run("epics")).toThrow(/Extract "epics" is not valid: items/);
		});
	});
});
