import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { dismissSessionGated } from "./dismissSessionGated";
import { dismissSession } from "./dismissSession";
import { killPtyTree } from "./killPtyTree";
import { reapWorktree } from "./worktree/reapWorktree";
import { resolveDoneDurability } from "./worktree/resolveDoneDurability";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./dismissSession", () => ({ dismissSession: vi.fn(() => true) }));
vi.mock("./killPtyTree", () => ({ killPtyTree: vi.fn() }));
vi.mock("./worktree/reapWorktree", () => ({
	reapWorktree: vi.fn(() => Promise.resolve(true)),
}));
vi.mock("./worktree/resolveDoneDurability", () => ({
	resolveDoneDurability: vi.fn(() => Promise.resolve()),
}));

const killMock = killPtyTree as unknown as ReturnType<typeof vi.fn>;
const reapMock = reapWorktree as unknown as ReturnType<typeof vi.fn>;
const resolveMock = resolveDoneDurability as unknown as ReturnType<
	typeof vi.fn
>;
const dismissMock = dismissSession as unknown as ReturnType<typeof vi.fn>;

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "3",
		name: "worktree session",
		commandType: "claude",
		status: "waiting",
		startedAt: 1,
		runningMs: 0,
		runningSince: null,
		pty: null,
		scrollback: "",
		...overrides,
	};
}

describe("dismissSessionGated", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("dismisses a non-worktree session immediately", () => {
		const s = session();
		const sessions = new Map([[s.id, s]]);
		const notify = vi.fn();

		dismissSessionGated(sessions, s.id, notify);

		expect(dismissMock).toHaveBeenCalledWith(sessions, "3");
		expect(notify).toHaveBeenCalledOnce();
		expect(resolveMock).not.toHaveBeenCalled();
	});

	it("group-kills the process tree and defers durability until the pty exits", () => {
		const pty = { pid: 42 } as unknown as Session["pty"];
		const s = session({
			pty,
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([[s.id, s]]);

		dismissSessionGated(sessions, s.id, vi.fn());

		expect(killMock).toHaveBeenCalledWith(pty);
		expect(resolveMock).not.toHaveBeenCalled();
		expect(s.pendingDismiss).toBeTypeOf("function");
	});

	it("resolves durability immediately when the worktree session has no live pty", () => {
		const s = session({
			pty: null,
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([[s.id, s]]);

		dismissSessionGated(sessions, s.id, vi.fn());

		expect(killMock).not.toHaveBeenCalled();
		expect(resolveMock).toHaveBeenCalledOnce();
	});

	it("marks the card closing and broadcasts it so the teardown is visible", () => {
		const pty = { pid: 42 } as unknown as Session["pty"];
		const s = session({
			pty,
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([[s.id, s]]);
		const notify = vi.fn();

		dismissSessionGated(sessions, s.id, notify);

		expect(s.closing).toBe(true);
		expect(notify).toHaveBeenCalled();
	});

	it("force-reaps and removes the card on an explicit discard, bypassing the gate", async () => {
		const s = session({
			pty: null,
			status: "stopped",
			undurable: { reason: "uncommitted changes" },
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sessions = new Map([[s.id, s]]);

		dismissSessionGated(sessions, s.id, vi.fn(), true);
		await Promise.resolve();

		expect(resolveMock).not.toHaveBeenCalled();
		expect(reapMock).toHaveBeenCalledWith("/git/repo-2", true);
		expect(dismissMock).toHaveBeenCalledWith(sessions, "3");
	});
});
