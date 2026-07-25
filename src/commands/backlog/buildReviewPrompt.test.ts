import { describe, expect, it } from "vitest";
import { buildReviewPrompt } from "./buildReviewPrompt";
import type { BacklogItem } from "./types";

function makeItem(overrides: Partial<BacklogItem> = {}): BacklogItem {
	return {
		id: 7,
		type: "story",
		name: "Test item",
		acceptanceCriteria: ["AC1"],
		status: "in-progress",
		starred: false,
		...overrides,
	};
}

describe("buildReviewPrompt", () => {
	describe("commitBeforeManualChecks", () => {
		it("leaves the prompt unchanged when the flag is off", () => {
			const prompt = buildReviewPrompt(makeItem(), 3, {
				commitBeforeManualChecks: false,
			});

			expect(prompt).toBe(buildReviewPrompt(makeItem(), 3));
			expect(prompt).not.toContain(
				"Before asking the user to confirm manual checks, run /commit",
			);
		});

		it("instructs the agent to commit before the manual check confirmation when the flag is on", () => {
			const prompt = buildReviewPrompt(makeItem(), 3, {
				commitBeforeManualChecks: true,
			});

			expect(prompt).toContain(
				"Before asking the user to confirm manual checks, run /commit to commit the work (it is fine if there is nothing new to commit).",
			);
			expect(prompt.indexOf("run /commit to commit the work")).toBeLessThan(
				prompt.indexOf(
					"After all criteria pass, ask the user to confirm any manual checks",
				),
			);
		});

		it("keeps the post-confirmation commit step when the flag is on", () => {
			const prompt = buildReviewPrompt(makeItem(), 3, {
				commitBeforeManualChecks: true,
			});

			expect(prompt).toContain("1. Run: /commit");
			expect(
				prompt.indexOf(
					"After all criteria pass, ask the user to confirm any manual checks",
				),
			).toBeLessThan(prompt.indexOf("1. Run: /commit"));
		});
	});
});
