import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { globalConfigFileLabel } from "./globalConfigFileLabel";

describe("globalConfigFileLabel", () => {
	it("shortens this host's own global config to ~/.assist.yml", () => {
		expect(globalConfigFileLabel(join(homedir(), ".assist.yml"))).toBe(
			"~/.assist.yml",
		);
	});

	it("names the host for a config file on a windows mount", () => {
		expect(globalConfigFileLabel("/mnt/c/Users/me/.assist.yml")).toBe(
			"/mnt/c/Users/me/.assist.yml on the Windows host",
		);
	});

	it("falls back to the bare path for anywhere else", () => {
		expect(globalConfigFileLabel("/etc/assist/.assist.yml")).toBe(
			"/etc/assist/.assist.yml",
		);
	});
});
