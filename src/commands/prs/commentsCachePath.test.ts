import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { commentsCachePath } from "./commentsCachePath";

describe("commentsCachePath", () => {
	it("builds the path under the home dir namespaced by org and repo", () => {
		expect(commentsCachePath("makerxstudio", "assist", 42)).toBe(
			join(
				homedir(),
				".assist",
				"pr-comments",
				"makerxstudio",
				"assist",
				"pr-42-comments.yaml",
			),
		);
	});

	it("does not write inside the working copy", () => {
		const path = commentsCachePath("makerxstudio", "assist", 42);

		expect(path.startsWith(join(homedir(), ".assist", "pr-comments"))).toBe(
			true,
		);
		expect(path.includes(join(".assist", "pr-42-comments.yaml"))).toBe(false);
	});

	it("maps the same PR number in different repos to distinct paths", () => {
		const a = commentsCachePath("org-a", "repo-a", 7);
		const b = commentsCachePath("org-b", "repo-b", 7);
		const sameOrg = commentsCachePath("org-a", "repo-b", 7);

		expect(a).not.toBe(b);
		expect(a).not.toBe(sameOrg);
	});
});
