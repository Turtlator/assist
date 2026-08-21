import { describe, expect, it } from "vitest";
import { assertNoResidualDrift } from "./assertNoResidualDrift";
import { buildFixStructurePlan } from "./buildFixStructurePlan";
import { defaultTypeChain, type PlacedIssue } from "./types";

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

describe("assertNoResidualDrift", () => {
	it("passes when the re-walked subtree plans nothing", () => {
		const plan = buildFixStructurePlan(
			[
				issue("1", { depth: 0, typeName: "Epic", childIds: ["2"] }),
				issue("2", { depth: 1, parentId: "1", typeName: "Story" }),
			],
			options,
		);

		expect(() => assertNoResidualDrift(plan, defaultTypeChain)).not.toThrow();
	});

	it("fails naming an issue whose type did not take", () => {
		const plan = buildFixStructurePlan(
			[
				issue("1", { depth: 0, typeName: "Epic", childIds: ["2"] }),
				issue("2", { depth: 1, parentId: "1", typeName: "Feature" }),
			],
			options,
		);

		expect(() => assertNoResidualDrift(plan, defaultTypeChain)).toThrow(
			/org\/repo#2 is still Feature, not Story/,
		);
	});

	it("fails naming a label that survived removal", () => {
		const plan = buildFixStructurePlan(
			[
				issue("1", {
					depth: 0,
					typeName: "Epic",
					labels: [{ id: "LA_1", name: "legacy" }],
				}),
			],
			{ ...options, stripLabels: ["legacy"] },
		);

		expect(() => assertNoResidualDrift(plan, defaultTypeChain)).toThrow(
			/org\/repo#1 still carries legacy/,
		);
	});

	it("fails when a child appeared below the leaf level while applying", () => {
		const plan = buildFixStructurePlan(
			[
				issue("1", { depth: 0, typeName: "Epic", childIds: ["2"] }),
				issue("2", {
					depth: 1,
					parentId: "1",
					typeName: "Story",
					childIds: ["3"],
				}),
				issue("3", {
					depth: 2,
					parentId: "2",
					typeName: "Sub-task",
					childIds: ["4"],
				}),
				issue("4", { depth: 3, parentId: "3", typeName: "Sub-task" }),
			],
			options,
		);

		expect(() => assertNoResidualDrift(plan, defaultTypeChain)).toThrow(
			/org\/repo#4 under org\/repo#3 sits below Subtask/,
		);
	});
});
