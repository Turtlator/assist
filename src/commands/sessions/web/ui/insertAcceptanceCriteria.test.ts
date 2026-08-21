import { describe, expect, it } from "vitest";
import { insertAcceptanceCriteria } from "./insertAcceptanceCriteria";
import { splitAcceptanceCriteria } from "./splitAcceptanceCriteria";

describe("insertAcceptanceCriteria", () => {
	it("appends the heading and one empty criterion", () => {
		expect(insertAcceptanceCriteria("## Background\n\nwhy")).toBe(
			"## Background\n\nwhy\n\n## Acceptance criteria\n\n1.",
		);
	});

	it("leaves the existing body byte-identical", () => {
		const body = "## Background\n\nwhy  \n\n## Notes\n\n- a\n";

		expect(insertAcceptanceCriteria(body).startsWith(body.trimEnd())).toBe(
			true,
		);
	});

	it("writes a section the outliner recognises", () => {
		const section = splitAcceptanceCriteria(insertAcceptanceCriteria("why"));

		expect(section?.items).toEqual([{ text: "", depth: 0 }]);
	});

	it("adds no leading blank lines to an empty body", () => {
		expect(insertAcceptanceCriteria("")).toBe("## Acceptance criteria\n\n1.");
	});
});
