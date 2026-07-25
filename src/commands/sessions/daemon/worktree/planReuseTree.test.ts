import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import { allocateTree } from "./allocateTree";
import { planReuseTree } from "./planReuseTree";
import type { TreeSpawnContext } from "./spawnInTree";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./allocateTree", () => ({ allocateTree: vi.fn() }));
vi.mock("./boundTreeRoots", () => ({
	boundTreeRoots: (sessions: Map<string, Session>, exclude?: Session) =>
		new Set(
			[...sessions.values()]
				.filter((s) => s !== exclude)
				.map((s) => s.cwd ?? ""),
		),
}));

const allocateMock = vi.mocked(allocateTree);

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "assist draft",
		commandType: "assist",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		pty: null,
		scrollback: "",
		cwd: "/git/repo",
		...overrides,
	} as Session;
}

function ctx(...sessions: Session[]): TreeSpawnContext {
	return {
		sessions: new Map(sessions.map((s) => [s.id, s])),
		spawnWith: vi.fn(),
		notify: vi.fn(),
		startHeld: vi.fn(),
	};
}

describe("planReuseTree", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("moves the card into the workspace the allocator picked", () => {
		allocateMock.mockReturnValue({
			cwd: "/git/repo-2",
			kind: "worktree",
			created: true,
			clone: "/git/repo",
		});
		const draft = session();

		expect(planReuseTree(draft, ctx(draft))?.cwd).toBe("/git/repo-2");
	});

	it("does not count the reused card itself as holding the clone", () => {
		allocateMock.mockReturnValue({
			cwd: "/git/repo",
			kind: "primary",
			created: false,
			clone: "/git/repo",
		});
		const draft = session();

		planReuseTree(draft, ctx(draft));

		expect(allocateMock).toHaveBeenCalledWith("/git/repo", new Set());
	});

	it("counts a session that shares the clone with it", () => {
		allocateMock.mockReturnValue({
			cwd: "/git/repo-2",
			kind: "worktree",
			created: true,
			clone: "/git/repo",
		});
		const draft = session();
		const coding = session({ id: "2" });

		planReuseTree(draft, ctx(draft, coding));

		expect(allocateMock).toHaveBeenCalledWith(
			"/git/repo",
			new Set(["/git/repo"]),
		);
	});

	it("leaves the card where it is when the clone is free", () => {
		allocateMock.mockReturnValue({
			cwd: "/git/repo",
			kind: "primary",
			created: false,
			clone: "/git/repo",
		});
		const draft = session();

		expect(planReuseTree(draft, ctx(draft))).toBeUndefined();
	});

	it("leaves a card that already has a workspace alone", () => {
		const inTree = session({
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});

		expect(planReuseTree(inTree, ctx(inTree))).toBeUndefined();
		expect(allocateMock).not.toHaveBeenCalled();
	});

	it("does nothing without a tree context", () => {
		expect(planReuseTree(session(), undefined)).toBeUndefined();
		expect(allocateMock).not.toHaveBeenCalled();
	});
});
