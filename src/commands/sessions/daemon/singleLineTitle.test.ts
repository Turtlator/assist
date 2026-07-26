import { describe, expect, it } from "vitest";
import { SESSION_TITLE_MAX_LENGTH } from "./generateSessionTitle";
import { singleLineTitle } from "./singleLineTitle";

describe("singleLineTitle", () => {
	it("collapses newlines and runs of whitespace into single spaces", () => {
		expect(singleLineTitle("the login page\n\nredirects  badly")).toBe(
			"the login page redirects badly",
		);
	});

	it("trims surrounding whitespace", () => {
		expect(singleLineTitle("  add dark mode\n")).toBe("add dark mode");
	});

	it("caps the length so the card cannot wrap", () => {
		expect(singleLineTitle("a ".repeat(200))).toHaveLength(
			SESSION_TITLE_MAX_LENGTH,
		);
	});
});
