import { describe, expect, it } from "vitest";
import { splitAcceptanceCriteria } from "./splitAcceptanceCriteria";

const body = [
	"## Background",
	"",
	"why",
	"",
	"## Acceptance criteria",
	"",
	"1. first",
	"   1. nested",
	"      1. deeper",
	"2. second",
	"",
	"## Out of scope",
	"",
	"nothing",
].join("\n");

describe("splitAcceptanceCriteria", () => {
	it("splits the body around the criteria, one item per line", () => {
		const section = splitAcceptanceCriteria(body);

		expect(section?.items).toEqual([
			{ text: "first", depth: 0 },
			{ text: "nested", depth: 1 },
			{ text: "deeper", depth: 2 },
			{ text: "second", depth: 0 },
		]);
		expect(section?.before).toEqual([
			"## Background",
			"",
			"why",
			"",
			"## Acceptance criteria",
			"",
		]);
		expect(section?.after).toEqual(["", "## Out of scope", "", "nothing"]);
	});

	it("matches the heading case-insensitively", () => {
		for (const heading of [
			"## acceptance criteria",
			"## Acceptance Criteria",
		]) {
			expect(splitAcceptanceCriteria(`${heading}\n\n1. only`)?.items).toEqual([
				{ text: "only", depth: 0 },
			]);
		}
	});

	it("reads indentation as depth whatever its width", () => {
		const section = splitAcceptanceCriteria(
			"## Acceptance criteria\n\n1. one\n  2) two\n    1. three\n  3) four",
		);

		expect(section?.items).toEqual([
			{ text: "one", depth: 0 },
			{ text: "two", depth: 1 },
			{ text: "three", depth: 2 },
			{ text: "four", depth: 1 },
		]);
	});

	it("returns nothing when the section is not an ordered list", () => {
		expect(
			splitAcceptanceCriteria("## Acceptance criteria\n\n- first\n- second"),
		).toBeNull();
		expect(
			splitAcceptanceCriteria(
				"## Acceptance criteria\n\n1. first\n- [ ] second",
			),
		).toBeNull();
		expect(
			splitAcceptanceCriteria(
				"## Acceptance criteria\n\nthe system does a thing",
			),
		).toBeNull();
	});

	it("returns nothing when there is no criteria heading", () => {
		expect(splitAcceptanceCriteria("## Notes\n\n1. first")).toBeNull();
	});

	it("treats an empty section as having no criteria", () => {
		const section = splitAcceptanceCriteria(
			"## Acceptance criteria\n\n## Notes\n\ntail",
		);

		expect(section?.items).toEqual([]);
		expect(section?.before).toEqual(["## Acceptance criteria"]);
		expect(section?.after).toEqual(["", "## Notes", "", "tail"]);
	});
});
