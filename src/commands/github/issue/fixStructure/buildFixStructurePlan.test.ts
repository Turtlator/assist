import { describe, expect, it } from "vitest";
import { buildFixStructurePlan } from "./buildFixStructurePlan";
import { defaultTypeChain, type IssueLabel, type PlacedIssue } from "./types";

const issueTypes = [
	{ id: "IT_epic", name: "Epic" },
	{ id: "IT_story", name: "Story" },
	{ id: "IT_sub", name: "Sub-task" },
	{ id: "IT_feature", name: "Feature" },
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

describe("buildFixStructurePlan", () => {
	it("types each level below the target to the next level down", () => {
		const plan = buildFixStructurePlan(
			[
				issue("1", { depth: 0, typeName: "Epic", childIds: ["2"] }),
				issue("2", {
					depth: 1,
					parentId: "1",
					typeName: null,
					childIds: ["3"],
				}),
				issue("3", { depth: 2, parentId: "2", typeName: "Feature" }),
			],
			options,
		);
		expect(
			plan.entries.map((entry) => [
				entry.issue.id,
				entry.level,
				entry.typeChange?.to ?? null,
			]),
		).toEqual([
			["1", "Epic", null],
			["2", "Story", "Story"],
			["3", "Subtask", "Sub-task"],
		]);
		expect(plan.typeChangeCount).toBe(2);
	});

	it("types untyped issues rather than skipping them", () => {
		const plan = buildFixStructurePlan(
			[
				issue("1", { depth: 0, typeName: "Epic", childIds: ["2"] }),
				issue("2", { depth: 1, parentId: "1", typeName: null }),
			],
			options,
		);
		expect(plan.entries[1]?.typeChange).toEqual({
			from: null,
			to: "Story",
			typeId: "IT_story",
		});
	});

	it("leaves the target's own type alone when the level was inferred", () => {
		const plan = buildFixStructurePlan(
			[issue("1", { depth: 0, typeName: "Feature" })],
			options,
		);
		expect(plan.entries[0]?.typeChange).toBeNull();
		expect(plan.typeChangeCount).toBe(0);
	});

	it("types the target itself when the level was asserted", () => {
		const plan = buildFixStructurePlan(
			[issue("1", { depth: 0, typeName: "Feature" })],
			{ ...options, rootAsserted: true },
		);
		expect(plan.entries[0]?.typeChange).toEqual({
			from: "Feature",
			to: "Epic",
			typeId: "IT_epic",
		});
	});

	it("plans nothing for an already-normalised subtree", () => {
		const plan = buildFixStructurePlan(
			[
				issue("1", { depth: 0, typeName: "Epic", childIds: ["2"] }),
				issue("2", {
					depth: 1,
					parentId: "1",
					typeName: "Story",
					childIds: ["3"],
				}),
				issue("3", { depth: 2, parentId: "2", typeName: "Sub-task" }),
			],
			options,
		);
		expect(plan.typeChangeCount).toBe(0);
		expect(plan.labelRemovalCount).toBe(0);
		expect(plan.tooDeep).toEqual([]);
	});

	it("starts the chain at an inferred story so children become subtasks", () => {
		const plan = buildFixStructurePlan(
			[
				issue("1", { depth: 0, typeName: "Story", childIds: ["2"] }),
				issue("2", { depth: 1, parentId: "1", typeName: "Feature" }),
			],
			{ ...options, rootLevelIndex: 1 },
		);
		expect(plan.entries.map((entry) => entry.level)).toEqual([
			"Story",
			"Subtask",
		]);
		expect(plan.entries[1]?.typeChange?.to).toBe("Sub-task");
	});

	it("reports anything deeper than the leaf level with its parent", () => {
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
		expect(plan.tooDeep).toHaveLength(1);
		expect(plan.tooDeep[0]?.issue.id).toBe("4");
		expect(plan.tooDeep[0]?.parent?.id).toBe("3");
		expect(plan.entries[3]?.typeChange).toBeNull();
	});

	it("removes stripped labels by the id found on that issue", () => {
		const legacyOnMeta: IssueLabel = { id: "LA_meta", name: "legacy" };
		const legacyOnRepo: IssueLabel = { id: "LA_repo", name: "Legacy" };
		const plan = buildFixStructurePlan(
			[
				issue("1", {
					depth: 0,
					typeName: "Epic",
					childIds: ["2"],
					labels: [legacyOnMeta, { id: "LA_keep", name: "bug" }],
				}),
				issue("2", {
					depth: 1,
					parentId: "1",
					typeName: "Story",
					repo: "org/other",
					labels: [legacyOnRepo],
				}),
			],
			{ ...options, stripLabels: ["legacy"] },
		);
		expect(plan.entries[0]?.labelRemovals).toEqual([legacyOnMeta]);
		expect(plan.entries[1]?.labelRemovals).toEqual([legacyOnRepo]);
		expect(plan.labelRemovalCount).toBe(2);
	});

	it("orders entries depth first so the tree reads top down", () => {
		const plan = buildFixStructurePlan(
			[
				issue("1", { depth: 0, typeName: "Epic", childIds: ["2", "4"] }),
				issue("2", {
					depth: 1,
					parentId: "1",
					typeName: "Story",
					childIds: ["3"],
				}),
				issue("4", { depth: 1, parentId: "1", typeName: "Story" }),
				issue("3", { depth: 2, parentId: "2", typeName: "Sub-task" }),
			],
			options,
		);
		expect(plan.entries.map((entry) => entry.issue.id)).toEqual([
			"1",
			"2",
			"3",
			"4",
		]);
	});

	it("fails when the organisation has no issue type for a chain level", () => {
		expect(() =>
			buildFixStructurePlan(
				[
					issue("1", { depth: 0, typeName: "Epic", childIds: ["2"] }),
					issue("2", { depth: 1, parentId: "1", typeName: null }),
				],
				{ ...options, issueTypes: [{ id: "IT_epic", name: "Epic" }] },
			),
		).toThrow(/no Story issue type/);
	});
});
