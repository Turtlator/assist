import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { toSessionInfo } from "./toSessionInfo";

vi.mock("node:fs", () => ({ existsSync: vi.fn(() => true) }));

const exists = vi.mocked(existsSync);

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "3",
		name: "assist backlog run 5",
		commandType: "assist",
		status: "error",
		startedAt: 1,
		runningMs: 0,
		runningSince: null,
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

describe("toSessionInfo joinable", () => {
	it("ships the daemon's verdict for a finished session with a workspace", () => {
		expect(toSessionInfo(session()).joinable).toBe(true);
	});

	it("ships a refusal for a session whose workspace is gone", () => {
		exists.mockReturnValue(false);
		expect(toSessionInfo(session()).joinable).toBe(false);
	});

	it("ships a refusal for a server run", () => {
		expect(toSessionInfo(session({ commandType: "run" })).joinable).toBe(false);
	});
});
