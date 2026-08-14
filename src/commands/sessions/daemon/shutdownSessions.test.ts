import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { shutdownSessions } from "./shutdownSessions";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const logMock = daemonLog as unknown as ReturnType<typeof vi.fn>;

function loggedLines(): string[] {
	return logMock.mock.calls.map((call) => String(call[0]));
}

function fakeSession(
	id: string,
	kill: () => void,
	status: Session["status"] = "running",
): Session {
	return {
		id,
		name: `Session ${id}`,
		status,
		pty: { kill } as unknown as Session["pty"],
	} as Session;
}

function sessionMap(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((session) => [session.id, session]));
}

describe("shutdownSessions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("kills every live pty", () => {
		const first = vi.fn();
		const second = vi.fn();

		shutdownSessions(
			sessionMap(fakeSession("1", first), fakeSession("2", second)),
		);

		expect(first).toHaveBeenCalledOnce();
		expect(second).toHaveBeenCalledOnce();
	});

	it("skips sessions that are already done", () => {
		const kill = vi.fn();

		shutdownSessions(sessionMap(fakeSession("1", kill, "done")));

		expect(kill).not.toHaveBeenCalled();
	});

	it("tears down the remaining sessions when a kill throws", () => {
		const survivor = vi.fn();
		const thrower = vi.fn(() => {
			throw new Error("AttachConsole failed");
		});

		shutdownSessions(
			sessionMap(fakeSession("1", thrower), fakeSession("2", survivor)),
		);

		expect(survivor).toHaveBeenCalledOnce();
		expect(loggedLines()).toContainEqual(
			expect.stringContaining("Session 1 (1) failed: AttachConsole failed"),
		);
		expect(loggedLines()).toContainEqual(
			expect.stringContaining("1 session(s) failed to die"),
		);
	});

	it("does not throw out of the shutdown loop", () => {
		const thrower = vi.fn(() => {
			throw new Error("AttachConsole failed");
		});

		expect(() =>
			shutdownSessions(sessionMap(fakeSession("1", thrower))),
		).not.toThrow();
	});
});
