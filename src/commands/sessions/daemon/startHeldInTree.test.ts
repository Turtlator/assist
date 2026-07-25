import { describe, expect, it, vi } from "vitest";
import type { SessionClient } from "./broadcast";
import { startHeldInTree } from "./startHeldInTree";
import type { Session } from "./types";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./wirePtyEvents", () => ({ wirePtyEvents: vi.fn() }));

function fakePty() {
	return { resize: vi.fn() } as unknown as Session["pty"];
}

function held(id: string, cwd: string): Session {
	return {
		id,
		name: `session ${id}`,
		commandType: "claude",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		pty: null,
		pendingStart: () => fakePty(),
		scrollback: "",
		cwd,
		worktree: { path: cwd, clone: "/git/repo" },
	};
}

function run(sessions: Session[], seeded: Session) {
	startHeldInTree(
		seeded,
		new Map(sessions.map((s) => [s.id, s])),
		new Set<SessionClient>(),
		vi.fn(),
		vi.fn(),
	);
}

describe("startHeldInTree", () => {
	it("starts an agent added to a stream whose workspace was still seeding", () => {
		const seeded = held("4", "/git/repo-2");
		const joined = held("5", "/git/repo-2");

		run([seeded, joined], seeded);

		expect(seeded.pty).not.toBeNull();
		expect(joined.pty).not.toBeNull();
		expect(joined.pendingStart).toBeUndefined();
	});

	it("leaves a session held in another workspace alone", () => {
		const seeded = held("4", "/git/repo-2");
		const elsewhere = held("6", "/git/repo-3");

		run([seeded, elsewhere], seeded);

		expect(seeded.pty).not.toBeNull();
		expect(elsewhere.pty).toBeNull();
		expect(elsewhere.pendingStart).toBeDefined();
	});
});
