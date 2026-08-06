import { describe, expect, it, vi } from "vitest";
import { enumerateConfigLeafKeys } from "../../shared/enumerateConfigLeafKeys";
import { assistConfigSchema } from "../../shared/types";
import { configHelpEntries } from "../configHelpEntries";
import { pendingConfigDocumentation } from "../verify/pendingConfigDocumentation";
import { configKeys } from "./configKeys";

function output(run: () => void): string {
	const lines: string[] = [];
	const log = vi.spyOn(console, "log").mockImplementation((line) => {
		lines.push(String(line));
	});
	try {
		run();
	} finally {
		log.mockRestore();
	}
	return lines.join("\n");
}

describe("configKeys", () => {
	it("lists every schema leaf", () => {
		const text = output(() => configKeys());

		for (const key of enumerateConfigLeafKeys(assistConfigSchema)) {
			expect(text).toContain(key);
		}
	});

	it("prints a note and setter for every documented schema leaf", () => {
		const text = output(() => configKeys());

		for (const key of enumerateConfigLeafKeys(assistConfigSchema)) {
			if (pendingConfigDocumentation.has(key)) continue;
			const entry = configHelpEntries.find(
				(candidate) => candidate.key === key,
			);
			expect(entry, `no configHelp entry for ${key}`).toBeDefined();
			expect(text).toContain(entry?.note);
			expect(text).toContain(entry?.setter);
		}
	});

	it("prints the default, note and setter for a key", () => {
		const text = output(() => configKeys("worktree.enabled"));
		const entry = configHelpEntries.find(
			(candidate) => candidate.key === "worktree.enabled",
		);

		expect(text).toContain("default: false");
		expect(text).toContain(entry?.note);
		expect(text).toContain(entry?.setter);
	});

	it("narrows to keys matching the filter", () => {
		const text = output(() => configKeys("worktree"));

		expect(text).toContain("worktree.enabled");
		expect(text).not.toContain("backup.dir");
	});

	it("matches the filter case-insensitively", () => {
		expect(output(() => configKeys("WORKTREE.ROOT"))).toContain(
			"worktree.root",
		);
	});

	it("reports a default of unset when the schema has none", () => {
		expect(output(() => configKeys("worktree.root"))).toContain(
			"default: unset",
		);
	});

	it("exits non-zero when nothing matches the filter", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const exit = vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("exit");
		}) as never);

		expect(() => configKeys("nosuchkey")).toThrow("exit");
		expect(error.mock.calls.join(" ")).toContain("No config key matches");

		error.mockRestore();
		exit.mockRestore();
	});
});
