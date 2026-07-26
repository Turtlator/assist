import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { drainSessions } from "./drainSessions";
import { killPtyTree } from "./killPtyTree";
import { resolveCloseDurability } from "./worktree/resolveCloseDurability";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./killPtyTree", () => ({ killPtyTree: vi.fn() }));
vi.mock("../../../shared/emitActivity", () => ({ removeActivity: vi.fn() }));
vi.mock("../../backlog/acquireLock", () => ({ releaseLock: vi.fn() }));
vi.mock("./worktree/reapWorktree", () => ({
	reapWorktree: vi.fn(() => Promise.resolve(true)),
}));
vi.mock("./worktree/resolveCloseDurability", () => ({
	resolveCloseDurability: vi.fn(() => Promise.resolve()),
}));

const killMock = killPtyTree as unknown as ReturnType<typeof vi.fn>;
const resolveMock = resolveCloseDurability as unknown as ReturnType<
	typeof vi.fn
>;

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
		pty: { pid: 1, kill: vi.fn() } as unknown as Session["pty"],
		scrollback: "",
		...overrides,
	};
}

describe("drainSessions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("removes plain sessions outright", () => {
		const a = session({ id: "1" });
		const b = session({ id: "2" });
		const sessions = new Map([
			[a.id, a],
			[b.id, b],
		]);

		expect(drainSessions(sessions, vi.fn())).toBe(2);

		expect(sessions.size).toBe(0);
		expect(resolveMock).not.toHaveBeenCalled();
	});

	it("routes a worktree session through the durability gate instead of deleting its card", () => {
		const held = session({
			id: "1",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([[held.id, held]]);

		drainSessions(sessions, vi.fn());

		expect(sessions.get("1")).toBe(held);
		expect(held.closing).toBe(true);
		expect(held.pendingDismiss).toBeTypeOf("function");
	});

	it("group-kills the process tree of a worktree session rather than the pty leader alone", () => {
		const pty = { pid: 42, kill: vi.fn() } as unknown as Session["pty"];
		const held = session({
			id: "1",
			pty,
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});

		drainSessions(new Map([[held.id, held]]), vi.fn());

		expect(killMock).toHaveBeenCalledWith(pty);
		expect(pty?.kill).not.toHaveBeenCalled();
	});

	it("returns zero when there is nothing to drain", () => {
		expect(drainSessions(new Map(), vi.fn())).toBe(0);
	});
});
