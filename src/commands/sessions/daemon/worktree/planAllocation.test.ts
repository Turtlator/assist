import { describe, expect, it } from "vitest";
import { nextWorktreePath, planAllocation } from "./planAllocation";

describe("planAllocation", () => {
	const clone = "/git/foo";

	it("reuses the clone's own tree when it is free", () => {
		expect(planAllocation(clone, new Set())).toBe("primary");
	});

	it("spills to a worktree when the clone is already bound", () => {
		expect(planAllocation(clone, new Set([clone]))).toBe("spill");
	});

	it("spills for a new session even when a sibling worktree is active", () => {
		expect(planAllocation(clone, new Set([clone, "/git/foo-2"]))).toBe("spill");
	});
});

describe("nextWorktreePath", () => {
	it("picks the first adjacent suffix starting at -2", () => {
		expect(nextWorktreePath("/git/foo", "/git", () => false)).toBe(
			"/git/foo-2",
		);
	});

	it("skips taken suffixes and never clobbers an existing path", () => {
		const taken = new Set(["/git/foo-2", "/git/foo-3"]);
		expect(nextWorktreePath("/git/foo", "/git", (p) => taken.has(p))).toBe(
			"/git/foo-4",
		);
	});

	it("honours a configured root distinct from the clone's parent", () => {
		expect(nextWorktreePath("/git/foo", "/scratch", () => false)).toBe(
			"/scratch/foo-2",
		);
	});
});
