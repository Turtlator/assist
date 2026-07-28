import { describe, expect, it } from "vitest";
import { configScopeToggleTitle } from "./configScopeToggleTitle";
import type { ConfigScope } from "./saveConfigValue";

const title = (
	scope: ConfigScope,
	scopesWithValue: ConfigScope[],
	lockedToGlobal = false,
) =>
	configScopeToggleTitle({
		scope,
		scopesWithValue,
		repoKey: "assist",
		lockedToGlobal,
	});

describe("configScopeToggleTitle", () => {
	it("names the file a scope is not set in", () => {
		expect(title("project", [])).toBe("Not set in this repo's assist.yml");
		expect(title("repo", [])).toBe("Not set in repos.assist in ~/.assist.yml");
		expect(title("global", [])).toBe("Not set in ~/.assist.yml");
	});

	it("marks the highest-precedence scope as in effect", () => {
		expect(title("repo", ["repo", "global"])).toBe(
			"Set in repos.assist in ~/.assist.yml — in effect",
		);
	});

	it("names the scope overriding a lower one", () => {
		expect(title("global", ["project", "repo", "global"])).toBe(
			"Set in ~/.assist.yml — overridden by Project",
		);
		expect(title("repo", ["repo", "global"], false)).toBe(
			"Set in repos.assist in ~/.assist.yml — in effect",
		);
		expect(title("global", ["repo", "global"])).toBe(
			"Set in ~/.assist.yml — overridden by This repo",
		);
	});

	it("explains why non-global scopes are disabled for a global-only key", () => {
		expect(title("project", ["global"], true)).toBe("Global-only key");
		expect(title("repo", ["global"], true)).toBe("Global-only key");
		expect(title("global", ["global"], true)).toBe(
			"Set in ~/.assist.yml — in effect",
		);
	});

	it("falls back to a generic repos description without a repo key", () => {
		expect(
			configScopeToggleTitle({
				scope: "repo",
				scopesWithValue: [],
				repoKey: undefined,
				lockedToGlobal: false,
			}),
		).toBe("Not set in this repo's entry under repos: in ~/.assist.yml");
	});
});
