import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fixStructure } from "./fixStructure";

type FakeIssue = {
	number: number;
	repo: string;
	typeName: string | null;
	labels: { id: string; name: string }[];
	childIds: string[];
};

const orgIssueTypes = [
	{ id: "IT_epic", name: "Epic" },
	{ id: "IT_story", name: "Story" },
	{ id: "IT_sub", name: "Sub-task" },
	{ id: "IT_initiative", name: "Initiative" },
	{ id: "IT_feature", name: "Feature" },
];

const graph = new Map<string, FakeIssue>();
const calls: string[] = [];
const lines: string[] = [];
/** Issues whose type write is accepted by the API but never actually takes. */
const stuck = new Set<string>();

vi.mock("./writeLineNow", () => ({
	writeLineNow: (line: string) => {
		lines.push(line);
	},
}));

function node(id: string): unknown {
	const issue = graph.get(id) as FakeIssue;
	return {
		id,
		number: issue.number,
		title: `issue ${issue.number}`,
		issueType: issue.typeName ? { name: issue.typeName } : null,
		repository: { nameWithOwner: issue.repo },
		labels: { nodes: issue.labels, pageInfo: { hasNextPage: false } },
		subIssues: {
			nodes: issue.childIds.map((childId) => ({ id: childId })),
			pageInfo: { hasNextPage: false },
		},
	};
}

vi.mock("../../../../shared/runGhGraphqlJson", () => ({
	runGhGraphqlJson: (query: string, vars: Record<string, unknown>) => {
		if (query.includes("organization(login:")) {
			return JSON.stringify({
				data: {
					organization: { issueTypes: { nodes: orgIssueTypes } },
				},
			});
		}
		if (query.includes("nodes(ids:")) {
			const ids = vars.ids as string[];
			return JSON.stringify({ data: { nodes: ids.map(node) } });
		}
		if (query.includes("repository(owner:")) {
			const id = [...graph.entries()].find(
				([, issue]) => issue.number === vars.number,
			)?.[0];
			return JSON.stringify({
				data: { repository: { issue: id ? node(id) : null } },
			});
		}
		if (query.includes("updateIssueIssueType")) {
			const issueId = String(vars.issueId);
			calls.push(`type ${issueId} ${vars.issueTypeId}`);
			const issue = graph.get(issueId);
			if (issue && !stuck.has(issueId)) {
				issue.typeName =
					orgIssueTypes.find((type) => type.id === vars.issueTypeId)?.name ??
					null;
			}
			return "{}";
		}
		const labelableId = String(vars.labelableId);
		const removed = vars.labelIds as string[];
		calls.push(`labels ${labelableId} ${removed.join(",")}`);
		const labelled = graph.get(labelableId);
		if (labelled) {
			labelled.labels = labelled.labels.filter(
				(label) => !removed.includes(label.id),
			);
		}
		return "{}";
	},
}));

function seed(issues: Record<string, Partial<FakeIssue> & { number: number }>) {
	graph.clear();
	for (const [id, issue] of Object.entries(issues)) {
		graph.set(id, {
			repo: "org/repo",
			typeName: null,
			labels: [],
			childIds: [],
			...issue,
		});
	}
}

let exited: number | undefined;

beforeEach(() => {
	calls.length = 0;
	lines.length = 0;
	stuck.clear();
	exited = undefined;
	vi.spyOn(console, "error").mockImplementation(() => undefined);
	vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
		exited = code;
		throw new Error("exit");
	}) as never);
});

afterEach(() => {
	vi.restoreAllMocks();
});

function run(target: string, options: Record<string, unknown>): void {
	try {
		fixStructure(target, options);
	} catch (error) {
		if (!(error instanceof Error) || error.message !== "exit") throw error;
	}
}

describe("fixStructure", () => {
	it("writes nothing without --apply", () => {
		seed({
			I_1: { number: 1, typeName: "Epic", childIds: ["I_2"] },
			I_2: { number: 2 },
		});

		run("org/repo#1", {});

		expect(calls).toEqual([]);
		expect(exited).toBeUndefined();
		expect(lines.join("\n")).toContain("Dry run");
	});

	it("types the subtree and confirms it with --apply", () => {
		seed({
			I_1: { number: 1, typeName: "Epic", childIds: ["I_2"] },
			I_2: { number: 2, repo: "org/other" },
		});

		run("org/repo#1", { apply: true });

		expect(calls).toEqual(["type I_2 IT_story"]);
		expect(exited).toBeUndefined();
		expect(lines.join("\n")).toContain("Subtree normalised");
	});

	it("types the target itself when --level asserts its position", () => {
		seed({ I_1: { number: 1, typeName: "Feature" } });

		run("org/repo#1", { apply: true, level: "epic" });

		expect(calls).toEqual(["type I_1 IT_epic"]);
	});

	it("exits non-zero without mutating when the target's type is off-chain", () => {
		seed({ I_1: { number: 1, typeName: "Feature" } });

		run("org/repo#1", { apply: true });

		expect(exited).toBe(1);
		expect(calls).toEqual([]);
	});

	it("exits non-zero without mutating when an issue sits below the leaf", () => {
		seed({
			I_1: { number: 1, typeName: "Epic", childIds: ["I_2"] },
			I_2: { number: 2, childIds: ["I_3"] },
			I_3: { number: 3, childIds: ["I_4"] },
			I_4: { number: 4 },
		});

		run("org/repo#1", { apply: true });

		expect(exited).toBe(1);
		expect(calls).toEqual([]);
	});

	it("exits non-zero when the re-walk still finds drift", () => {
		seed({
			I_1: { number: 1, typeName: "Epic", childIds: ["I_2"] },
			I_2: { number: 2 },
		});
		stuck.add("I_2");

		run("org/repo#1", { apply: true });

		expect(calls).toEqual(["type I_2 IT_story"]);
		expect(exited).toBe(1);
	});

	it("makes no writes on a second run over a normalised subtree", () => {
		seed({
			I_1: { number: 1, typeName: "Feature", childIds: ["I_2"] },
			I_2: { number: 2 },
		});

		run("org/repo#1", { apply: true, level: "epic" });
		expect(calls).toEqual(["type I_1 IT_epic", "type I_2 IT_story"]);

		calls.length = 0;
		lines.length = 0;
		run("org/repo#1", { apply: true, level: "epic" });

		expect(calls).toEqual([]);
		expect(lines.join("\n")).toContain("Nothing to change");
	});
	it("normalises against a chain given by --type-chain", () => {
		seed({
			I_1: { number: 1, typeName: "Initiative", childIds: ["I_2"] },
			I_2: { number: 2, typeName: "Story" },
		});

		run("org/repo#1", { apply: true, typeChain: "Initiative,Feature" });

		expect(calls).toEqual(["type I_2 IT_feature"]);
		expect(exited).toBeUndefined();
	});

	it("exits non-zero without mutating when --type-chain names an unknown type", () => {
		seed({
			I_1: { number: 1, typeName: "Epic", childIds: ["I_2"] },
			I_2: { number: 2 },
		});

		run("org/repo#1", { apply: true, typeChain: "Epic,Widget" });

		expect(exited).toBe(1);
		expect(calls).toEqual([]);
	});

	it("removes each --strip-label by the id found on that issue", () => {
		seed({
			I_1: {
				number: 1,
				typeName: "Epic",
				childIds: ["I_2"],
				labels: [
					{ id: "LA_meta_legacy", name: "legacy" },
					{ id: "LA_meta_keep", name: "bug" },
					{ id: "LA_meta_triage", name: "needs-triage" },
				],
			},
			I_2: {
				number: 2,
				typeName: "Story",
				repo: "org/other",
				labels: [{ id: "LA_other_legacy", name: "Legacy" }],
			},
		});

		run("org/repo#1", {
			apply: true,
			stripLabel: ["legacy", "needs-triage"],
		});

		expect(calls).toEqual([
			"labels I_1 LA_meta_legacy,LA_meta_triage",
			"labels I_2 LA_other_legacy",
		]);
		expect(exited).toBeUndefined();
		expect(graph.get("I_1")?.labels).toEqual([
			{ id: "LA_meta_keep", name: "bug" },
		]);
	});

	it("leaves labels alone when none are named", () => {
		seed({
			I_1: {
				number: 1,
				typeName: "Epic",
				childIds: ["I_2"],
				labels: [{ id: "LA_legacy", name: "legacy" }],
			},
			I_2: { number: 2, typeName: "Story" },
		});

		run("org/repo#1", { apply: true });

		expect(calls).toEqual([]);
		expect(lines.join("\n")).toContain("Nothing to change");
	});
});
