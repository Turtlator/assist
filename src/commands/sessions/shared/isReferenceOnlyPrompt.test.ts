import { describe, expect, it } from "vitest";
import {
	isBareReferencePrompt,
	isReferenceOnlyPrompt,
} from "./isReferenceOnlyPrompt";

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
		"look at https://centium.atlassian.net/browse/PA-556",
		"https://github.com/owner/repo/issues/12 breaks on save",
		"see\nhttps://myteam.slack.com/archives/C123/p1700000000000\nfor context",
	])("defers on a tracker url surrounded by prose: %j", (prompt) => {
		expect(isReferenceOnlyPrompt(prompt)).toBe(true);
	});

	it.each([
		"PA-556 is failing on save",
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

describe("isBareReferencePrompt", () => {
	it.each([
		"https://centium.atlassian.net/browse/PA-556",
		"PA-556",
		"#123",
		"a791",
		"PA-556 https://github.com/owner/repo/issues/12",
		"  PA-556\n",
	])("treats %j as nothing but references", (prompt) => {
		expect(isBareReferencePrompt(prompt)).toBe(true);
	});

	it.each([
		"look at https://centium.atlassian.net/browse/PA-556",
		"https://github.com/owner/repo/issues/12 breaks on save",
		"PA-556 is failing on save",
		"the login page redirects",
		"",
		"   ",
	])("treats %j as carrying prose worth summarising", (prompt) => {
		expect(isBareReferencePrompt(prompt)).toBe(false);
	});
});
