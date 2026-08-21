import { describe, expect, it } from "vitest";
import { parseIssueNode } from "./parseIssueNode";

const node = {
	id: "I_1",
	number: 12,
	title: "Migrate the thing",
	issueType: { name: "Sub-task" },
	repository: { nameWithOwner: "org/repo" },
	labels: {
		nodes: [{ id: "LA_1", name: "legacy" }],
		pageInfo: { hasNextPage: false },
	},
	subIssues: { nodes: [{ id: "I_2" }], pageInfo: { hasNextPage: false } },
};

describe("parseIssueNode", () => {
	it("reads the id, number, repo, type, label ids and child ids", () => {
		expect(parseIssueNode(node)).toEqual({
			id: "I_1",
			number: 12,
			title: "Migrate the thing",
			repo: "org/repo",
			typeName: "Sub-task",
			labels: [{ id: "LA_1", name: "legacy" }],
			childIds: ["I_2"],
		});
	});

	it("reports an untyped issue as having no type", () => {
		expect(parseIssueNode({ ...node, issueType: null }).typeName).toBeNull();
	});

	it("refuses to silently drop labels or children past the first page", () => {
		expect(() =>
			parseIssueNode({
				...node,
				labels: { ...node.labels, pageInfo: { hasNextPage: true } },
			}),
		).toThrow(/more than 100 labels/);
		expect(() =>
			parseIssueNode({
				...node,
				subIssues: { ...node.subIssues, pageInfo: { hasNextPage: true } },
			}),
		).toThrow(/more than 100 sub-issues/);
	});
});
