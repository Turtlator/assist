import { describe, expect, it } from "vitest";
import { isReferenceOnlyPrompt } from "./isReferenceOnlyPrompt";

describe("isReferenceOnlyPrompt", () => {
	it.each([
		"https://centium.atlassian.net/browse/PA-556",
		"http://centium.atlassian.net/browse/PA-556",
		"https://github.com/owner/repo/issues/12",
		"https://myteam.slack.com/archives/C123/p1700000000000",
		"PA-556",
		"AB1-42",
		"#123",
		"a791",
		"a3f0",
	])("treats %s as a reference", (prompt) => {
		expect(isReferenceOnlyPrompt(prompt)).toBe(true);
	});

	it("accepts several references separated by whitespace", () => {
		expect(
			isReferenceOnlyPrompt(
				"PA-556 https://github.com/owner/repo/issues/12\n#7 a791",
			),
		).toBe(true);
	});

	it("ignores surrounding whitespace", () => {
		expect(isReferenceOnlyPrompt("  PA-556\n")).toBe(true);
	});

	it.each([
		"PA-556 is failing on save",
		"look at https://centium.atlassian.net/browse/PA-556",
		"fix #123 before release",
		"the login page redirects",
		"add dark mode to the settings page",
	])("treats %s as having real content", (prompt) => {
		expect(isReferenceOnlyPrompt(prompt)).toBe(false);
	});

	it.each(["", "   ", "\n\t"])("rejects empty input %j", (prompt) => {
		expect(isReferenceOnlyPrompt(prompt)).toBe(false);
	});

	it.each([
		"https://example.com/browse/PA-556",
		"ftp://github.com/owner/repo",
		"github.com/owner/repo",
		"pa-556",
		"A-1",
		"#",
		"#abc",
		"a7",
		"azz1",
	])("does not treat %s as a reference", (prompt) => {
		expect(isReferenceOnlyPrompt(prompt)).toBe(false);
	});
});
