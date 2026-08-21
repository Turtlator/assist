import { describe, expect, it } from "vitest";
import { convertAcceptanceCriteria } from "./convertAcceptanceCriteria";

describe("convertAcceptanceCriteria", () => {
	it("rewrites bullets as numbered items at their indentation depth", () => {
		const body = [
			"## Background",
			"",
			"why",
			"",
			"## Acceptance criteria",
			"",
			"- first",
			"  - nested",
			"    * deeper",
			"+ second",
			"",
			"## Out of scope",
			"",
			"nothing",
		].join("\n");

		expect(convertAcceptanceCriteria(body)).toBe(
			[
				"## Background",
				"",
				"why",
				"",
				"## Acceptance criteria",
				"",
				"1. first",
				"   1. nested",
				"      1. deeper",
				"1. second",
				"",
				"## Out of scope",
				"",
				"nothing",
			].join("\n"),
		);
	});

	it("strips checkbox markers and leaves the item text unchanged", () => {
		const body = [
			"## Acceptance criteria",
			"",
			"- [ ] the `worker` is idle",
			"- [x] done, with **emphasis**",
		].join("\n");

		expect(convertAcceptanceCriteria(body)).toBe(
			[
				"## Acceptance criteria",
				"",
				"1. the `worker` is idle",
				"1. done, with **emphasis**",
			].join("\n"),
		);
	});

	it("makes one item per prose line", () => {
		expect(
			convertAcceptanceCriteria(
				"## Acceptance criteria\n\nthe system does a thing\nand another",
			),
		).toBe(
			"## Acceptance criteria\n\n1. the system does a thing\n1. and another",
		);
	});

	it("keeps already numbered items untouched", () => {
		const body = "## Acceptance criteria\n\n1. first\n- second";

		expect(convertAcceptanceCriteria(body)).toBe(
			"## Acceptance criteria\n\n1. first\n1. second",
		);
	});

	it("returns the body unchanged when there is no section", () => {
		const body = "## Notes\n\n- first";

		expect(convertAcceptanceCriteria(body)).toBe(body);
	});
});
