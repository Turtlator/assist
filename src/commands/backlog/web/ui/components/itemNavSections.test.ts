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

	it("omits rows for sections the item does not have", () => {
		const sections = itemNavSections(
			item({
				description: "d",
				acceptanceCriteria: ["a"],
				subtasks: [],
				gitRefs: [],
				comments: [],
			}),
		);

		expect(sections.map((s) => s.label)).toEqual([
			"Description",
			"Acceptance Criteria",
		]);
	});

	it("renders a nested numbered row per phase, status-tinted, named only in the title", () => {
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
			{ id: "item-section-plan", label: "Phases" },
			{
				id: "item-phase-0",
				label: "1",
				title: "First",
				status: "done",
				nested: true,
			},
			{
				id: "item-phase-1",
				label: "2",
				title: "Second",
				status: "current",
				nested: true,
			},
			{
				id: "item-phase-2",
				label: "3",
				title: "Third",
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

		expect(withoutReview.map((s) => s.title ?? s.label)).toEqual([
			"Phases",
			"First",
		]);
		expect(withReview.map((s) => s.title ?? s.label)).toEqual([
			"Phases",
			"First",
			"Review",
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
			"Phases",
			"1",
			"Activity",
			"Comments",
		]);
	});
});
