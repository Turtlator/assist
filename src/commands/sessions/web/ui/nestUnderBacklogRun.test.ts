import { describe, expect, it } from "vitest";
import { nestUnderBacklogRun } from "./nestUnderBacklogRun";
import type { SessionInfo } from "./types";

const group = { origin: "host/org/assist", clone: "/git/assist" };

function session(id: string, cwd: string): SessionInfo {
	return {
		id,
		name: id,
		commandType: "assist",
		status: "running",
		startedAt: 0,
		cwd,
		repoGroup: group,
	};
}

function run(id: string, cwd: string): SessionInfo {
	return {
		...session(id, cwd),
		activity: { kind: "backlog", startedAt: 0 },
	};
}

describe("nestUnderBacklogRun", () => {
	it("nests a session sharing a worktree cwd under the backlog run", () => {
		const sessions = [
			run("run", "/git/assist-2"),
			session("review", "/git/assist-2"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1]] },
		]);
	});

	it("nests a child listed before its run beneath it", () => {
		const sessions = [
			session("review", "/git/assist-2"),
			run("run", "/git/assist-2"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[1], children: [sessions[0]] },
		]);
	});

	it("keeps sessions in the main clone un-nested", () => {
		const sessions = [
			run("run", "/git/assist"),
			session("review", "/git/assist"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("keeps sessions without a repo group un-nested", () => {
		const sessions = [
			{ ...run("run", "/git/assist-2"), repoGroup: undefined },
			{ ...session("review", "/git/assist-2"), repoGroup: undefined },
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("leaves an orphaned child at the top level when no run shares its tree", () => {
		const sessions = [
			session("review", "/git/assist-2"),
			session("prompt", "/git/assist-3"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("nests every non-backlog session in the tree, in their original order", () => {
		const sessions = [
			run("run", "/git/assist-2"),
			session("review", "/git/assist-2"),
			session("comments", "/git/assist-2"),
			session("prompt", "/git/assist-2"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{
				session: sessions[0],
				children: [sessions[1], sessions[2], sessions[3]],
			},
		]);
	});

	it("attaches children to the first run when two runs share a tree", () => {
		const sessions = [
			run("first", "/git/assist-2"),
			run("second", "/git/assist-2"),
			session("review", "/git/assist-2"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[2]] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("keeps sessions in sibling worktrees on separate rows", () => {
		const sessions = [
			run("run-a", "/git/assist-2"),
			run("run-b", "/git/assist-3"),
			session("review-b", "/git/assist-3"),
			session("review-a", "/git/assist-2"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[3]] },
			{ session: sessions[1], children: [sessions[2]] },
		]);
	});
});
