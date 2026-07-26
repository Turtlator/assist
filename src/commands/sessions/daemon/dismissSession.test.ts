import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { dismissSession } from "./dismissSession";
import { killPtyTree } from "./killPtyTree";
import { reapWorktree } from "./worktree/reapWorktree";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./killPtyTree", () => ({ killPtyTree: vi.fn() }));
vi.mock("../../../shared/emitActivity", () => ({ removeActivity: vi.fn() }));
vi.mock("../../backlog/acquireLock", () => ({ releaseLock: vi.fn() }));
vi.mock("./worktree/reapWorktree", () => ({
	reapWorktree: vi.fn(() => Promise.resolve(true)),
}));

const killMock = killPtyTree as unknown as ReturnType<typeof vi.fn>;
const reapMock = reapWorktree as unknown as ReturnType<typeof vi.fn>;

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		waitingSince: null,
		pty: { pid: 7, kill: vi.fn() } as unknown as Session["pty"],
		scrollback: "",
		...overrides,
	};
}

describe("dismissSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("group-kills the process tree rather than the pty leader alone", () => {
		const s = session();

		dismissSession(new Map([[s.id, s]]), s.id);

		expect(killMock).toHaveBeenCalledWith(s.pty);
	});

	it("reaps the worktree of the last card holding it", () => {
		const s = session({
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});

		dismissSession(new Map([[s.id, s]]), s.id);

		expect(reapMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("never reaps a worktree another card is still working in", () => {
		const agent = session({
			id: "1",
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sibling = session({
			id: "2",
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([
			[agent.id, agent],
			[sibling.id, sibling],
		]);

		dismissSession(sessions, agent.id);

		expect(reapMock).not.toHaveBeenCalled();
		expect(sessions.get("2")).toBe(sibling);
	});
});
