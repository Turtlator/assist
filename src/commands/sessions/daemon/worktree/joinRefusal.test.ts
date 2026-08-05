import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import { joinRefusal } from "./joinRefusal";

vi.mock("node:fs", () => ({ existsSync: vi.fn(() => true) }));

const exists = vi.mocked(existsSync);

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "3",
		name: "assist backlog run 5",
		commandType: "assist",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		waitingSince: null,
		pty: null,
		scrollback: "",
		cwd: "/git/repo-2",
		worktree: { path: "/git/repo-2", clone: "/git/repo" },
		...overrides,
	};
}

beforeEach(() => {
	exists.mockReset();
	exists.mockReturnValue(true);
});

describe("joinRefusal", () => {
	it("takes another agent into a working session", () => {
		expect(joinRefusal(session())).toBeUndefined();
	});

	it("takes another agent into a finished, errored or stopped session", () => {
		for (const status of ["done", "error", "stopped"] as const)
			expect(joinRefusal(session({ status }))).toBeUndefined();
	});

	it("refuses a server run", () => {
		expect(joinRefusal(session({ commandType: "run" }))).toBe(
			"a server run has no agent stream",
		);
	});

	it("refuses a session whose workspace is being torn down", () => {
		expect(joinRefusal(session({ closing: true }))).toBe(
			"the session is closing",
		);
	});

	it("refuses a session with no working directory", () => {
		expect(joinRefusal(session({ cwd: undefined, worktree: undefined }))).toBe(
			"the session has no working directory",
		);
	});

	it("refuses a session whose workspace has been reaped from disk", () => {
		exists.mockReturnValue(false);
		expect(joinRefusal(session())).toBe(
			"the session's workspace no longer exists",
		);
		expect(exists).toHaveBeenCalledWith("/git/repo-2");
	});
});
