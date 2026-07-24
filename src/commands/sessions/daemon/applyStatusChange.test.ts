import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyStatusChange } from "./applyStatusChange";
import type { Session } from "./createSession";
import { resolveDoneDurability } from "./worktree/resolveDoneDurability";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./flushPhaseActiveMs", () => ({
	flushPhaseActiveMs: vi.fn(() => Promise.resolve()),
}));
vi.mock("./worktree/resolveDoneDurability", () => ({
	resolveDoneDurability: vi.fn(() => Promise.resolve()),
}));

const resolveMock = resolveDoneDurability as unknown as ReturnType<
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

	it("skips the gate for a done transition on a non-worktree session", () => {
		const session = backlogRun({ status: "waiting", worktree: undefined });

		applyStatusChange(session, "done", 0, vi.fn(), vi.fn(), vi.fn());

		expect(resolveMock).not.toHaveBeenCalled();
		expect(session.status).toBe("done");
	});
});
