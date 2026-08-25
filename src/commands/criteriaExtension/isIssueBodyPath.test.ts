import { describe, expect, it } from "vitest";
import { isIssueBodyPath } from "./isIssueBodyPath";

describe("isIssueBodyPath", () => {
	it("matches an issue page", () => {
		expect(isIssueBodyPath("/staff0rd/assist/issues/42")).toBe(true);
	});

	it("matches an issue page with a trailing segment", () => {
		expect(isIssueBodyPath("/staff0rd/assist/issues/42/")).toBe(true);
	});

	it("matches the new-issue form", () => {
		expect(isIssueBodyPath("/staff0rd/assist/issues/new")).toBe(true);
	});

	it("matches the new-issue form with a template query path", () => {
		expect(isIssueBodyPath("/staff0rd/assist/issues/new/choose")).toBe(true);
	});

	it("rejects the issue list", () => {
		expect(isIssueBodyPath("/staff0rd/assist/issues")).toBe(false);
	});

	it("rejects a pull request", () => {
		expect(isIssueBodyPath("/staff0rd/assist/pull/42")).toBe(false);
	});

	it("rejects the dashboard", () => {
		expect(isIssueBodyPath("/")).toBe(false);
	});
});
