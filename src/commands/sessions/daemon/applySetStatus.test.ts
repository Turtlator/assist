import { beforeEach, describe, expect, it, vi } from "vitest";
import { applySetStatus } from "./applySetStatus";
import type { Session } from "./createSession";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "3",
		name: "worktree session",
		commandType: "claude",
		status: "waiting",
		startedAt: 1,
		runningMs: 0,
		runningSince: null,
		waitingSince: null,
		pty: null,
		scrollback: "",
		...overrides,
	};
}

describe("applySetStatus", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("forwards a status change for a live session", () => {
		const s = session({ status: "waiting" });
		const onStatusChange = vi.fn();

		applySetStatus(
			new Map([[s.id, s]]),
			s.id,
			"running",
			"pretool",
			onStatusChange,
		);

		expect(onStatusChange).toHaveBeenCalledWith(s, "running");
	});

	it("ignores hooks for a stopped session so a zombie process cannot resurrect it", () => {
		const s = session({
			status: "stopped",
			undurable: { reason: "unpushed commits" },
		});
		const onStatusChange = vi.fn();

		applySetStatus(
			new Map([[s.id, s]]),
			s.id,
			"running",
			"pretool",
			onStatusChange,
		);

		expect(onStatusChange).not.toHaveBeenCalled();
		expect(s.status).toBe("stopped");
	});
});
