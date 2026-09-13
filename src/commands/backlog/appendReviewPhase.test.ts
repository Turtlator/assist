import { describe, expect, it } from "vitest";
import { appendReviewPhase } from "./appendReviewPhase";
import { REVIEW_PHASE_NAME } from "./buildPhasePrompt";

describe("appendReviewPhase", () => {
	it("appends the runner-owned Review phase", () => {
		const plan = [{ name: "Fix", tasks: [{ task: "patch it" }] }];

		expect(appendReviewPhase(plan).map((p) => p.name)).toEqual([
			"Fix",
			REVIEW_PHASE_NAME,
		]);
	});

	it("appends to an empty plan", () => {
		expect(appendReviewPhase([]).map((p) => p.name)).toEqual([
			REVIEW_PHASE_NAME,
		]);
	});

	it("leaves a plan that already ends with a Review phase alone", () => {
		const plan = [
			{ name: "Fix", tasks: [{ task: "patch it" }] },
			{ name: REVIEW_PHASE_NAME, tasks: [{ task: "check it" }] },
		];

		expect(appendReviewPhase(plan)).toBe(plan);
	});

	it("still appends when Review is not the last phase", () => {
		const plan = [
			{ name: REVIEW_PHASE_NAME, tasks: [{ task: "check it" }] },
			{ name: "Fix", tasks: [{ task: "patch it" }] },
		];

		expect(appendReviewPhase(plan).map((p) => p.name)).toEqual([
			REVIEW_PHASE_NAME,
			"Fix",
			REVIEW_PHASE_NAME,
		]);
	});

	it("does not mutate the given plan", () => {
		const plan = [{ name: "Fix", tasks: [{ task: "patch it" }] }];

		appendReviewPhase(plan);

		expect(plan.map((p) => p.name)).toEqual(["Fix"]);
	});
});
