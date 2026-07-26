import { describe, expect, it, vi } from "vitest";
import type { SessionClient } from "./broadcast";
import { startHeldSession } from "./startHeldSession";
import type { Session } from "./types";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./wirePtyEvents", () => ({ wirePtyEvents: vi.fn() }));

function heldSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "4",
		name: "assist backlog run 772",
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

function fakePty() {
	return { resize: vi.fn() } as unknown as Session["pty"];
}

describe("startHeldSession", () => {
	it("spawns the held pty once seeding completes", () => {
		const pty = fakePty();
		const session = heldSession({ pendingStart: () => pty });
		const notify = vi.fn();

		startHeldSession(
			session,
			new Map([[session.id, session]]),
			new Set<SessionClient>(),
			vi.fn(),
			notify,
		);

		expect(session.pty).toBe(pty);
		expect(session.pendingStart).toBeUndefined();
		expect(notify).toHaveBeenCalled();
	});

	it("does not spawn when the card was dismissed while its tree was seeding", () => {
		const start = vi.fn(() => fakePty());
		const session = heldSession({ pendingStart: start });

		startHeldSession(
			session,
			new Map(),
			new Set<SessionClient>(),
			vi.fn(),
			vi.fn(),
		);

		expect(start).not.toHaveBeenCalled();
		expect(session.pty).toBeNull();
	});

	it("applies the dimensions the browser reported while the pty was held", () => {
		const pty = fakePty();
		const session = heldSession({
			pendingStart: () => pty,
			cols: 200,
			rows: 50,
		});

		startHeldSession(
			session,
			new Map([[session.id, session]]),
			new Set<SessionClient>(),
			vi.fn(),
			vi.fn(),
		);

		expect(pty?.resize).toHaveBeenCalledWith(200, 50);
	});

	it("is inert for a session that was never held", () => {
		const session = heldSession();
		const notify = vi.fn();

		startHeldSession(
			session,
			new Map([[session.id, session]]),
			new Set<SessionClient>(),
			vi.fn(),
			notify,
		);

		expect(session.pty).toBeNull();
		expect(notify).not.toHaveBeenCalled();
	});
});
