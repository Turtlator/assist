import { describe, expect, it } from "vitest";
import { writeAcceptanceCriteria } from "./writeAcceptanceCriteria";

describe("writeAcceptanceCriteria", () => {
	it("writes a nested ordered list with three spaces per level", () => {
		const body = "## Acceptance criteria\n\n1. first";

		expect(
			writeAcceptanceCriteria(body, [
				{ text: "first", depth: 0 },
				{ text: "nested", depth: 1 },
				{ text: "deeper", depth: 2 },
				{ text: "second", depth: 0 },
			]),
		).toBe(
			[
				"## Acceptance criteria",
				"",
				"1. first",
				"   1. nested",
				"      1. deeper",
				"1. second",
			].join("\n"),
		);
	});

	it("leaves the rest of the body byte-identical", () => {
		const body = [
			"## Background",
			"",
			"why  ",
			"",
			"## Acceptance criteria",
			"",
			"1. first",
			"2. second",
			"",
			"## Out of scope",
			"",
			"nothing",
		].join("\n");

		expect(
			writeAcceptanceCriteria(body, [
				{ text: "first edited", depth: 0 },
				{ text: "second", depth: 0 },
			]),
		).toBe(
			[
				"## Background",
				"",
				"why  ",
				"",
				"## Acceptance criteria",
				"",
				"1. first edited",
				"1. second",
				"",
				"## Out of scope",
				"",
				"nothing",
			].join("\n"),
		);
	});

	it("writes a bare marker for an empty criterion", () => {
		expect(
			writeAcceptanceCriteria("## Acceptance criteria\n\n1. first", [
				{ text: "", depth: 0 },
			]),
		).toBe("## Acceptance criteria\n\n1.");
	});

	it("returns the body unchanged when there is no section to write", () => {
		const body = "## Notes\n\nnothing here";

		expect(writeAcceptanceCriteria(body, [{ text: "one", depth: 0 }])).toBe(
			body,
		);
	});
});
