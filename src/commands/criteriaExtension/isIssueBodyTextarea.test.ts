// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { isIssueBodyTextarea } from "./isIssueBodyTextarea";

function textarea(attributes: Record<string, string>): HTMLTextAreaElement {
	const field = document.createElement("textarea");
	for (const [name, value] of Object.entries(attributes))
		field.setAttribute(name, value);
	return field;
}

describe("isIssueBodyTextarea", () => {
	it("matches the legacy edit form field", () => {
		expect(isIssueBodyTextarea(textarea({ name: "issue[body]" }))).toBe(true);
	});

	it("matches the react editor field", () => {
		expect(isIssueBodyTextarea(textarea({ id: "issue-body-textarea" }))).toBe(
			true,
		);
	});

	it("matches a data-testid hint", () => {
		expect(
			isIssueBodyTextarea(textarea({ "data-testid": "issue-body-input" })),
		).toBe(true);
	});

	it("rejects a comment field", () => {
		expect(isIssueBodyTextarea(textarea({ name: "comment[body]" }))).toBe(
			false,
		);
	});

	it("rejects a comment field that also names the issue body", () => {
		expect(
			isIssueBodyTextarea(
				textarea({ id: "issue-body-textarea", name: "comment[body]" }),
			),
		).toBe(false);
	});

	it("rejects an unrelated field", () => {
		expect(isIssueBodyTextarea(textarea({ name: "issue[title]" }))).toBe(false);
	});
});
