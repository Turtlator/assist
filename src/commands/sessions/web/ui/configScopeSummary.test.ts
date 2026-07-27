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

	it("names the repos entry a repo-scoped save writes to", () => {
		expect(
			configScopeSummary(entry(["global"], { repoKey: "assist" }), "repo"),
		).toBe(
			"Set in global. Saving writes to repos.assist in ~/.assist.yml. Nothing to clear in repos.assist.",
		);
	});

	it("says a repo-scoped clear reverts to the schema default", () => {
		expect(
			configScopeSummary(entry(["repo"], { repoKey: "assist" }), "repo"),
		).toBe(
			"Set in repos.assist. Saving writes to repos.assist in ~/.assist.yml. Clear reverts it to the schema default.",
		);
	});

	it("names the layer a repo-scoped clear falls back to", () => {
		expect(
			configScopeSummary(
				entry(["repo", "global"], { repoKey: "assist" }),
				"repo",
			),
		).toBe(
			"Set in repos.assist and global. Saving writes to repos.assist in ~/.assist.yml. Clear falls back to global.",
		);
	});

	it("describes the repos entry a repo-scoped save creates", () => {
		expect(configScopeSummary(entry([]), "repo")).toBe(
			"Not set in project or global — showing the schema default. Saving writes to this repo's entry under repos: in ~/.assist.yml.",
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
