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
	it("matches the react editor body field", () => {
		expect(
			isIssueBodyTextarea(
				textarea({
					id: "_r_eu_",
					"aria-label": "Markdown value",
					placeholder: "Type your description here…",
				}),
			),
		).toBe(true);
	});

	it("rejects the react new-comment field beside it", () => {
		expect(
			isIssueBodyTextarea(
				textarea({
					id: "_r_ch_",
					placeholder: "Use Markdown to format your comment",
				}),
			),
		).toBe(false);
	});

	it("rejects an edit-comment field", () => {
		expect(
			isIssueBodyTextarea(textarea({ placeholder: "Leave a comment" })),
		).toBe(false);
	});

	it("matches the legacy edit form field", () => {
		expect(isIssueBodyTextarea(textarea({ name: "issue[body]" }))).toBe(true);
	});

	it("matches a legacy id", () => {
		expect(isIssueBodyTextarea(textarea({ id: "issue_body" }))).toBe(true);
	});

	it("matches a data-testid hint", () => {
		expect(
			isIssueBodyTextarea(textarea({ "data-testid": "issue-body-input" })),
		).toBe(true);
	});

	it("rejects a comment field that also names the issue body", () => {
		expect(
			isIssueBodyTextarea(
				textarea({ id: "issue-body-textarea", name: "comment[body]" }),
			),
		).toBe(false);
	});

	it("rejects a field with no useful attributes", () => {
		expect(isIssueBodyTextarea(textarea({ id: "_r_zz_" }))).toBe(false);
	});

	it("rejects the issue title field", () => {
		expect(isIssueBodyTextarea(textarea({ name: "issue[title]" }))).toBe(false);
	});
});
