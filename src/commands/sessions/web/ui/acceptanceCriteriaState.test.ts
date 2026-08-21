import { describe, expect, it } from "vitest";
import { acceptanceCriteriaState } from "./acceptanceCriteriaState";

describe("acceptanceCriteriaState", () => {
	it("outlines an ordered section", () => {
		const state = acceptanceCriteriaState(
			"## Acceptance criteria\n\n1. first\n   1. nested\n\n## Notes\n\ntail",
		);

		expect(state).toEqual({
			kind: "outline",
			items: [
				{ text: "first", depth: 0 },
				{ text: "nested", depth: 1 },
			],
			before: "## Acceptance criteria\n",
			after: "\n## Notes\n\ntail",
		});
	});

	it("offers a convert button for a section that is not an ordered list", () => {
		const state = acceptanceCriteriaState(
			"## Background\n\nwhy\n\n## Acceptance criteria\n\n- first\n\n## Notes",
		);

		expect(state).toEqual({
			kind: "convert",
			before: "## Background\n\nwhy\n\n## Acceptance criteria\n\n- first",
			after: "\n## Notes",
		});
	});

	it("offers an insert button when there is no criteria heading", () => {
		const body = "## Background\n\nwhy";

		expect(acceptanceCriteriaState(body)).toEqual({
			kind: "insert",
			before: body,
			after: "",
		});
	});
});
