import { describe, expect, it } from "vitest";
import type { Session } from "../createSession";
import { joinableStream } from "./joinableStream";

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "3",
		name: "assist backlog run 5",
		commandType: "assist",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		pty: null,
		scrollback: "",
		cwd: "/git/repo-2",
		worktree: { path: "/git/repo-2", clone: "/git/repo" },
		...overrides,
	};
}

function ask(target: Session | undefined, id = "3") {
	const sessions = new Map<string, Session>();
	if (target) sessions.set(target.id, target);
	return joinableStream(sessions, id);
}

describe("joinableStream", () => {
	it("takes another agent into a working session", () => {
		const target = session();
		expect(ask(target)).toEqual({ session: target });
	});

	it("takes another agent into a session awaiting input", () => {
		const target = session({ status: "waiting" });
		expect(ask(target)).toEqual({ session: target });
	});

	it("refuses a session that is gone", () => {
		expect(ask(undefined)).toEqual({ reason: "no such session" });
	});

	it("refuses a server run", () => {
		expect(ask(session({ commandType: "run" }))).toEqual({
			reason: "a server run has no agent stream",
		});
	});

	it("refuses a session whose workspace is being torn down", () => {
		expect(ask(session({ closing: true }))).toEqual({
			reason: "the session is closing",
		});
	});

	it("refuses a finished or stopped session", () => {
		expect(ask(session({ status: "done" }))).toEqual({
			reason: "the session is done",
		});
		expect(ask(session({ status: "stopped" }))).toEqual({
			reason: "the session is stopped",
		});
	});

	it("refuses a session with no working directory", () => {
		expect(ask(session({ cwd: undefined, worktree: undefined }))).toEqual({
			reason: "the session has no working directory",
		});
	});
});
