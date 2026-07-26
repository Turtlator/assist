import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyStatusChange } from "./applyStatusChange";
import type { Session } from "./createSession";
import { resolveCloseDurability } from "./worktree/resolveCloseDurability";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./flushPhaseActiveMs", () => ({
	flushPhaseActiveMs: vi.fn(() => Promise.resolve()),
}));
vi.mock("./worktree/resolveCloseDurability", () => ({
	resolveCloseDurability: vi.fn(() => Promise.resolve()),
}));

const resolveMock = resolveCloseDurability as unknown as ReturnType<
	typeof vi.fn
>;

function backlogRun(overrides: Partial<Session> = {}): Session {
	return {
		id: "9",
		name: "assist backlog run 5",
		commandType: "assist",
		assistArgs: ["backlog", "run", "5"],
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		waitingSince: null,
		pty: null,
		scrollback: "",
		worktree: { path: "/git/repo-2", clone: "/git/repo" },
		...overrides,
	};
}

describe("applyStatusChange worktree reap gating", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("never reaps a worktree-backed backlog run between phase transitions", () => {
		const session = backlogRun({ status: "running" });
		const dismiss = vi.fn();

		applyStatusChange(session, "waiting", undefined, dismiss, vi.fn(), vi.fn());
		applyStatusChange(session, "running", undefined, dismiss, vi.fn(), vi.fn());
		applyStatusChange(session, "waiting", undefined, dismiss, vi.fn(), vi.fn());

		expect(resolveMock).not.toHaveBeenCalled();
		expect(dismiss).not.toHaveBeenCalled();
		expect(session.worktree).toEqual({
			path: "/git/repo-2",
			clone: "/git/repo",
		});
	});

	it("routes through the durability gate only on the final done transition", () => {
		const session = backlogRun({ status: "waiting" });

		applyStatusChange(session, "done", 0, vi.fn(), vi.fn(), vi.fn());

		expect(resolveMock).toHaveBeenCalledTimes(1);
		expect(resolveMock).toHaveBeenCalledWith(
			session,
			expect.any(Function),
			expect.any(Function),
		);
		expect(session.status).toBe("waiting");
	});

	it("keeps the worktree when a done transition chains straight into an auto-run", () => {
		const session = backlogRun({
			status: "running",
			name: "assist draft --once something",
			assistArgs: ["draft", "--once", "something"],
			autoRun: true,
			activity: {
				kind: "command",
				name: "draft",
				itemId: 772,
				startedAt: 1,
			},
		});
		const reuseForRun = vi.fn();

		applyStatusChange(session, "done", 0, vi.fn(), vi.fn(), reuseForRun);

		expect(resolveMock).not.toHaveBeenCalled();
		expect(reuseForRun).toHaveBeenCalledWith(session, 772);
		expect(session.worktree).toEqual({
			path: "/git/repo-2",
			clone: "/git/repo",
		});
	});

	it("keeps the workspace when another agent in that stream is still working", () => {
		const session = backlogRun({ status: "running" });
		const dismiss = vi.fn();

		applyStatusChange(
			session,
			"done",
			0,
			dismiss,
			vi.fn(),
			vi.fn(),
			() => true,
		);

		expect(resolveMock).not.toHaveBeenCalled();
		expect(session.status).toBe("done");
		expect(session.closing).toBeUndefined();
		expect(session.worktree).toEqual({
			path: "/git/repo-2",
			clone: "/git/repo",
		});
	});

	it("runs the gate on done once no other agent shares the workspace", () => {
		const session = backlogRun({ status: "running" });

		applyStatusChange(
			session,
			"done",
			0,
			vi.fn(),
			vi.fn(),
			vi.fn(),
			() => false,
		);

		expect(resolveMock).toHaveBeenCalledTimes(1);
	});

	it("skips the gate for a done transition on a non-worktree session", () => {
		const session = backlogRun({ status: "waiting", worktree: undefined });

		applyStatusChange(session, "done", 0, vi.fn(), vi.fn(), vi.fn());

		expect(resolveMock).not.toHaveBeenCalled();
		expect(session.status).toBe("done");
	});
});

describe("applyStatusChange undurable hold reason", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("keeps the hold reason when the card is held as stopped", () => {
		const session = backlogRun({
			status: "waiting",
			undurable: { reason: "unpushed commits" },
		});

		applyStatusChange(session, "stopped", undefined, vi.fn(), vi.fn(), vi.fn());

		expect(session.undurable).toEqual({ reason: "unpushed commits" });
	});

	it("clears a stale hold reason once the card leaves stopped", () => {
		const session = backlogRun({
			status: "stopped",
			undurable: { reason: "unpushed commits" },
		});

		applyStatusChange(session, "running", undefined, vi.fn(), vi.fn(), vi.fn());

		expect(session.undurable).toBeUndefined();
	});

	it("clears a stale hold reason on a waiting phase transition", () => {
		const session = backlogRun({
			status: "running",
			undurable: { reason: "unpushed commits" },
		});

		applyStatusChange(session, "waiting", undefined, vi.fn(), vi.fn(), vi.fn());

		expect(session.undurable).toBeUndefined();
	});
});
