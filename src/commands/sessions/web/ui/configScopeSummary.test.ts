import { describe, expect, it } from "vitest";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import type { ConfigSource } from "../../../config/resolveConfigSources";
import { configScopeSummary } from "./configScopeSummary";

function entry(
	sources: ConfigSource[],
	extra: Partial<ConfigEntry> = {},
): ConfigEntry {
	return {
		key: "worktree.trunk",
		type: "boolean",
		value: true,
		source: sources[0] ?? "default",
		sources,
		...extra,
	} as ConfigEntry;
}

describe("configScopeSummary", () => {
	it("reports the schema default when no file sets the key", () => {
		expect(configScopeSummary(entry([]), "project")).toBe(
			"Not set in project or global — showing the schema default.",
		);
	});

	it("names every layer holding a value", () => {
		expect(configScopeSummary(entry(["project", "global"]), "project")).toBe(
			"Set in project and global. Clear falls back to global.",
		);
	});

	it("warns when the selected scope holds no value", () => {
		expect(configScopeSummary(entry(["global"]), "project")).toBe(
			"Set in global. Nothing to clear in project.",
		);
	});

	it("says clearing the only value reverts to the schema default", () => {
		expect(configScopeSummary(entry(["global"]), "global")).toBe(
			"Set in global. Clear reverts it to the schema default.",
		);
	});

	it("names the repos key that keeps pinning the value", () => {
		expect(
			configScopeSummary(
				entry(["repo", "global"], { repoKey: "assist" }),
				"global",
			),
		).toBe("Set in repos.assist and global. Clear falls back to repos.assist.");
	});
});
