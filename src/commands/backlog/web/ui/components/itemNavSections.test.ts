import { describe, expect, it } from "vitest";
import type { BacklogItem } from "../types";
import { itemNavSections } from "./itemNavSections";

const item = (overrides: Partial<BacklogItem> = {}): BacklogItem => ({
	id: 1,
	type: "story",
	name: "An item",
	acceptanceCriteria: [],
	status: "todo",
	...overrides,
});

describe("itemNavSections", () => {
	it("returns no rows for an empty item", () => {
		expect(itemNavSections(item())).toEqual([]);
	});

	it("renders a nested row per phase, numbered and status-tinted", () => {
		const sections = itemNavSections(
			item({
				plan: [
					{ name: "First", tasks: [] },
					{ name: "Second", tasks: [] },
					{ name: "Third", tasks: [] },
				],
				currentPhase: 2,
			}),
		);

		expect(sections).toEqual([
			{ id: "item-section-plan", label: "Plan" },
			{ id: "item-phase-0", label: "1. First", status: "done", nested: true },
			{
				id: "item-phase-1",
				label: "2. Second",
				status: "current",
				nested: true,
			},
			{
				id: "item-phase-2",
				label: "3. Third",
				status: "upcoming",
				nested: true,
			},
		]);
	});

	it("appends a Review phase row only when review sessions exist", () => {
		const plan = [{ name: "First", tasks: [] }];
		const withoutReview = itemNavSections(item({ plan }));
		const withReview = itemNavSections(
			item({
				plan,
				phaseSessions: [
					{
						phaseIdx: 1,
						claudeSessionId: "s",
						hostname: "h",
						osUser: "u",
					},
				],
			}),
		);

		expect(withoutReview.map((s) => s.label)).toEqual(["Plan", "1. First"]);
		expect(withReview.map((s) => s.label)).toEqual([
			"Plan",
			"1. First",
			"2. Review",
		]);
	});

	it("places phase rows between Sub-tasks and Activity", () => {
		const sections = itemNavSections(
			item({
				description: "d",
				subtasks: [{ title: "t", status: "todo" }],
				plan: [{ name: "First", tasks: [] }],
				gitRefs: [{ kind: "branch", ref: "b" }],
				comments: [{ text: "c", timestamp: "now", type: "comment" }],
			}),
		);

		expect(sections.map((s) => s.label)).toEqual([
			"Description",
			"Sub-tasks",
			"Plan",
			"1. First",
			"Activity",
			"Comments",
		]);
	});
});
