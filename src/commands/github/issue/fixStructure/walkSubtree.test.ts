import { describe, expect, it, vi } from "vitest";
import type { SubtreeIssue } from "./types";
import { walkSubtree } from "./walkSubtree";

function issue(id: string, childIds: string[] = []): SubtreeIssue {
	return {
		id,
		number: Number(id.replace(/\D/g, "")),
		title: `issue ${id}`,
		repo: "org/repo",
		typeName: null,
		labels: [],
		childIds,
	};
}

const graph: Record<string, SubtreeIssue> = {
	root: issue("root", ["a1", "a2"]),
	a1: issue("a1", ["b1"]),
	a2: issue("a2"),
	b1: issue("b1", ["c1"]),
	c1: issue("c1"),
};

const fetchIssues = (ids: string[]): SubtreeIssue[] =>
	ids.map((id) => graph[id]).filter((found) => found !== undefined);

describe("walkSubtree", () => {
	it("walks level by level recording depth and parent", () => {
		const walked = walkSubtree(graph.root as SubtreeIssue, 3, fetchIssues);
		expect(
			walked.map((placed) => [placed.id, placed.depth, placed.parentId]),
		).toEqual([
			["root", 0, null],
			["a1", 1, "root"],
			["a2", 1, "root"],
			["b1", 2, "a1"],
			["c1", 3, "b1"],
		]);
	});

	it("issues one query per level rather than one per issue", () => {
		const spy = vi.fn(fetchIssues);
		walkSubtree(graph.root as SubtreeIssue, 3, spy);
		expect(spy).toHaveBeenCalledTimes(3);
		expect(spy.mock.calls[0]?.[0]).toEqual(["a1", "a2"]);
	});

	it("stops one level past the leaf so the offender is still reported", () => {
		const walked = walkSubtree(graph.root as SubtreeIssue, 2, fetchIssues);
		expect(walked.map((placed) => placed.id)).toEqual([
			"root",
			"a1",
			"a2",
			"b1",
		]);
	});

	it("visits an issue reachable twice only once", () => {
		const shared: Record<string, SubtreeIssue> = {
			root: issue("root", ["a1", "a2"]),
			a1: issue("a1", ["shared"]),
			a2: issue("a2", ["shared"]),
			shared: issue("shared"),
		};
		const walked = walkSubtree(shared.root as SubtreeIssue, 3, (ids) =>
			ids.map((id) => shared[id]).filter((found) => found !== undefined),
		);
		expect(walked.filter((placed) => placed.id === "shared")).toHaveLength(1);
	});
});
