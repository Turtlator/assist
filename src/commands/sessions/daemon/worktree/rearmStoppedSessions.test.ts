import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import { dismissSession } from "../dismissSession";
import { rearmStoppedSessions } from "./rearmStoppedSessions";
import { resolveCloseDurability } from "./resolveCloseDurability";

vi.mock("../dismissSession", () => ({ dismissSession: vi.fn(() => true) }));
vi.mock("./resolveCloseDurability", () => ({
	resolveCloseDurability: vi.fn(() => Promise.resolve()),
}));

const dismissMock = dismissSession as unknown as ReturnType<typeof vi.fn>;
const resolveMock = resolveCloseDurability as unknown as ReturnType<
	typeof vi.fn
>;

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "claude",
		status: "stopped",
		startedAt: 1,
		runningMs: 0,
		runningSince: null,
		pty: null,
		scrollback: "",
		cwd: "/git/repo-2",
		worktree: { path: "/git/repo-2", clone: "/git/repo" },
		...overrides,
	};
}

function map(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((s) => [s.id, s]));
}

describe("rearmStoppedSessions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("re-runs the durability gate for a stopped card restored across a restart", () => {
		const s = session();

		rearmStoppedSessions(map(s), () => {});

		expect(resolveMock).toHaveBeenCalledTimes(1);
		expect(resolveMock.mock.calls[0]?.[0]).toBe(s);
	});

	it("re-arms a stopped card holding the clone's own tree", () => {
		rearmStoppedSessions(map(session({ worktree: undefined })), () => {});

		expect(resolveMock).toHaveBeenCalledTimes(1);
	});

	it("removes the card when the gate now finds the work landed", () => {
		const sessions = map(session());
		resolveMock.mockImplementation((_s, finalize: () => void) => {
			finalize();
			return Promise.resolve();
		});
		const notify = vi.fn();

		rearmStoppedSessions(sessions, notify);

		expect(dismissMock).toHaveBeenCalledWith(sessions, "1");
		expect(notify).toHaveBeenCalled();
	});

	it("leaves live and finished cards alone", () => {
		rearmStoppedSessions(
			map(
				session({ id: "1", status: "running" }),
				session({ id: "2", status: "done" }),
			),
			() => {},
		);

		expect(resolveMock).not.toHaveBeenCalled();
	});
});
