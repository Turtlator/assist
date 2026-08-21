import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyFixStructurePlan } from "./applyFixStructurePlan";
import { buildFixStructurePlan } from "./buildFixStructurePlan";
import { defaultTypeChain, type PlacedIssue } from "./types";

const events: string[] = [];

vi.mock("./writeLineNow", () => ({
	writeLineNow: (line: string) => {
		events.push(`say ${line}`);
	},
}));

vi.mock("../../../../shared/runGhGraphqlJson", () => ({
	runGhGraphqlJson: (query: string, vars: Record<string, unknown>) => {
		const name = query.includes("updateIssueIssueType")
			? "updateIssueIssueType"
			: "removeLabelsFromLabelable";
		events.push(`gh ${name} ${JSON.stringify(vars)}`);
		return "{}";
	},
}));

const issueTypes = [
	{ id: "IT_epic", name: "Epic" },
	{ id: "IT_story", name: "Story" },
	{ id: "IT_sub", name: "Sub-task" },
];

function issue(
	id: string,
	overrides: Partial<PlacedIssue> & { depth: number },
): PlacedIssue {
	return {
		id,
		number: Number(id.replace(/\D/g, "")),
		title: `issue ${id}`,
		repo: "org/repo",
		typeName: null,
		labels: [],
		childIds: [],
		parentId: null,
		...overrides,
	};
}

const options = {
	chain: defaultTypeChain,
	rootLevelIndex: 0,
	rootAsserted: false,
	issueTypes,
};

beforeEach(() => {
	events.length = 0;
});

describe("applyFixStructurePlan", () => {
	it("announces each write before issuing it", () => {
		const plan = buildFixStructurePlan(
			[
				issue("1", { depth: 0, typeName: "Epic", childIds: ["2"] }),
				issue("2", { depth: 1, parentId: "1", typeName: null }),
			],
			options,
		);

		applyFixStructurePlan(plan);

		expect(events).toHaveLength(2);
		expect(events[0]).toContain("org/repo#2 type no type -> Story");
		expect(events[1]).toBe(
			'gh updateIssueIssueType {"issueId":"2","issueTypeId":"IT_story"}',
		);
	});

	it("writes parents before their children", () => {
		const plan = buildFixStructurePlan(
			[
				issue("1", { depth: 0, typeName: "Feature", childIds: ["2"] }),
				issue("2", {
					depth: 1,
					parentId: "1",
					typeName: null,
					childIds: ["3"],
				}),
				issue("3", { depth: 2, parentId: "2", typeName: null }),
			],
			{ ...options, rootAsserted: true },
		);

		applyFixStructurePlan(plan);

		expect(events.filter((event) => event.startsWith("gh"))).toEqual([
			'gh updateIssueIssueType {"issueId":"1","issueTypeId":"IT_epic"}',
			'gh updateIssueIssueType {"issueId":"2","issueTypeId":"IT_story"}',
			'gh updateIssueIssueType {"issueId":"3","issueTypeId":"IT_sub"}',
		]);
	});

	it("removes each label by the id found on that issue's repo", () => {
		const plan = buildFixStructurePlan(
			[
				issue("1", {
					depth: 0,
					typeName: "Epic",
					childIds: ["2"],
					labels: [
						{ id: "LA_meta", name: "legacy" },
						{ id: "LA_keep", name: "bug" },
					],
				}),
				issue("2", {
					depth: 1,
					parentId: "1",
					typeName: "Story",
					repo: "org/other",
					labels: [{ id: "LA_other", name: "Legacy" }],
				}),
			],
			{ ...options, stripLabels: ["legacy"] },
		);

		applyFixStructurePlan(plan);

		expect(events.filter((event) => event.startsWith("gh"))).toEqual([
			'gh removeLabelsFromLabelable {"labelableId":"1","labelIds":["LA_meta"]}',
			'gh removeLabelsFromLabelable {"labelableId":"2","labelIds":["LA_other"]}',
		]);
	});

	it("writes nothing for an already-normalised subtree", () => {
		const plan = buildFixStructurePlan(
			[
				issue("1", { depth: 0, typeName: "Epic", childIds: ["2"] }),
				issue("2", { depth: 1, parentId: "1", typeName: "Sub-task" }),
			],
			{ ...options, rootLevelIndex: 1 },
		);

		applyFixStructurePlan(plan);

		expect(events).toEqual([]);
	});
});
