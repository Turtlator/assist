import { describe, expect, it } from "vitest";
import { assertNothingTooDeep } from "./assertNothingTooDeep";
import { defaultTypeChain, type PlacedIssue } from "./types";

function issue(number: number, repo = "org/repo"): PlacedIssue {
	return {
		id: `I_${number}`,
		number,
		title: `issue ${number}`,
		repo,
		typeName: null,
		labels: [],
		childIds: [],
		depth: 0,
		parentId: null,
	};
}

describe("assertNothingTooDeep", () => {
	it("passes when nothing sits below the leaf level", () => {
		expect(() => assertNothingTooDeep([], defaultTypeChain)).not.toThrow();
	});

	it("names the offending issue, its parent and the leaf level", () => {
		expect(() =>
			assertNothingTooDeep(
				[{ issue: issue(4, "org/other"), parent: issue(3) }],
				defaultTypeChain,
			),
		).toThrow(/org\/other#4 under org\/repo#3 sits below Subtask/);
	});

	it("names every offender rather than only the first", () => {
		try {
			assertNothingTooDeep(
				[
					{ issue: issue(4), parent: issue(3) },
					{ issue: issue(5), parent: issue(3) },
				],
				defaultTypeChain,
			);
			expect.unreachable();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			expect(message).toContain("org/repo#4");
			expect(message).toContain("org/repo#5");
		}
	});

	it("reports an offender with no known parent", () => {
		expect(() =>
			assertNothingTooDeep(
				[{ issue: issue(4), parent: null }],
				defaultTypeChain,
			),
		).toThrow(/org\/repo#4 sits below Subtask/);
	});
});
