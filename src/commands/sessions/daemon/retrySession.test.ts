import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { handlePtyExit } from "./handlePtyExit";
import { retrySession } from "./retrySession";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({
		onData: vi.fn(),
		onExit: vi.fn(),
	})),
}));

const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;

function makeSession(overrides: Partial<Session>): Session {
	return {
		id: "1",
		name: "repo/session",
		commandType: "claude",
		status: "done",
		startedAt: 123,
		runningMs: 0,
		runningSince: null,
		waitingSince: null,
		pty: null,
		scrollback: "old output",
		restored: false,
		...overrides,
	};
}

describe("retrySession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("respawns a run session via assist run", () => {
		const session = makeSession({
			commandType: "run",
			runName: "build",
			runArgs: ["--watch"],
			cwd: "/home/user/repo",
		});

		expect(retrySession(session, new Set(), vi.fn())).toBe(true);

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "run", "build", "--watch"],
			"/home/user/repo",
		);
		expect(session.status).toBe("running");
		expect(session.scrollback).toBe("");
		expect(session.restored).toBeUndefined();
	});

	it("respawns an assist session from its persisted args", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["draft"],
			cwd: "/home/user/repo",
		});

		expect(retrySession(session, new Set(), vi.fn())).toBe(true);

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "draft"],
			"/home/user/repo",
			"1",
		);
		expect(session.status).toBe("running");
		expect(session.restored).toBeUndefined();
	});

	it("kills the running process tree and defers the respawn until it exits", () => {
		const killSpy = vi.spyOn(process, "kill").mockImplementation(() => true);
		const ptyKill = vi.fn();
		const session = makeSession({
			commandType: "run",
			status: "running",
			runName: "start:dev",
			runArgs: [],
			cwd: "/home/user/repo",
			pty: { kill: ptyKill, pid: 4321 } as unknown as Session["pty"],
		});

		expect(retrySession(session, new Set(), vi.fn())).toBe(true);

		expect(killSpy).toHaveBeenCalledWith(-4321, "SIGHUP");
		expect(ptyKill).not.toHaveBeenCalled();
		expect(spawnPtyMock).not.toHaveBeenCalled();
		expect(session.pendingRestart).toBeTypeOf("function");

		session.pendingRestart?.();

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "run", "start:dev"],
			"/home/user/repo",
		);
		expect(session.status).toBe("running");
		killSpy.mockRestore();
	});

	it("keeps a retried session running when the old pty's exit lands", () => {
		const killSpy = vi.spyOn(process, "kill").mockImplementation(() => true);
		const onStatusChange = vi.fn();
		const session = makeSession({
			commandType: "run",
			status: "running",
			runName: "start:dev",
			runArgs: [],
			cwd: "/home/user/repo",
			pty: { kill: vi.fn(), pid: 4321 } as unknown as Session["pty"],
		});

		retrySession(session, new Set(), onStatusChange);
		handlePtyExit(session, 0, onStatusChange);

		expect(onStatusChange).not.toHaveBeenCalled();
		expect(session.status).toBe("running");
		expect(session.pty).not.toBeNull();
		expect(session.pendingRestart).toBeUndefined();
		killSpy.mockRestore();
	});

	it("does not retry claude sessions", () => {
		const session = makeSession({ commandType: "claude" });

		expect(retrySession(session, new Set(), vi.fn())).toBe(false);
		expect(spawnPtyMock).not.toHaveBeenCalled();
	});

	it("does not retry an assist session without persisted args", () => {
		const session = makeSession({ commandType: "assist" });

		expect(retrySession(session, new Set(), vi.fn())).toBe(false);
		expect(spawnPtyMock).not.toHaveBeenCalled();
	});
});
