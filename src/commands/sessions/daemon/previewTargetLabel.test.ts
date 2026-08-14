import { describe, expect, it } from "vitest";
import { previewTargetLabel } from "./previewTargetLabel";

describe("previewTargetLabel", () => {
	it("labels a github issue", () => {
		expect(previewTargetLabel("github-issue", "story", null, false)).toBe(
			"github issue",
		);
	});

	it("labels a backlog comment", () => {
		expect(previewTargetLabel("backlog-comment", "story", null, false)).toBe(
			"backlog comment",
		);
	});

	it("labels a pr comment", () => {
		expect(previewTargetLabel("pr-comment", "story", 42, false)).toBe(
			"pr comment",
		);
	});

	it("labels a backlog item by its type", () => {
		expect(previewTargetLabel("backlog-item", "bug", null, false)).toBe(
			"backlog bug",
		);
		expect(previewTargetLabel("backlog-item", "story", null, false)).toBe(
			"backlog story",
		);
	});

	it("labels a PR edit by its number", () => {
		expect(previewTargetLabel("pr", "story", 42, false)).toBe("edit #42");
	});

	it("labels a new PR by its draft state", () => {
		expect(previewTargetLabel("pr", "story", null, false)).toBe("create");
		expect(previewTargetLabel("pr", "story", null, true)).toBe("create draft");
	});
});
