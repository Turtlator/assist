import { describe, expect, it, vi } from "vitest";
import { createSession, type Session } from "../createSession";
import { spawnIntoStream } from "./spawnIntoStream";
import type { TreeSpawnContext } from "./spawnInTree";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../createSession", () => ({
	createSession: vi.fn(
		(
			id: string,
			prompt?: string,
			cwd?: string,
			_d?: boolean,
			_h?: unknown,
			hold?: boolean,
		) =>
			({
				id,
				name: prompt ?? `Session ${id}`,
				commandType: "claude",
				status: "running",
				startedAt: 1,
				runningMs: 0,
				runningSince: 1,
				pty: hold ? null : ({} as Session["pty"]),
				pendingStart: hold ? () => null : undefined,
				scrollback: "",
				cwd,
			}) as Session,
	),
}));

function target(overrides: Partial<Session> = {}): Session {
	return {
		id: "3",
		name: "assist backlog run 5",
		commandType: "assist",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		pty: {} as Session["pty"],
		scrollback: "",
		cwd: "/git/repo-2",
		worktree: { path: "/git/repo-2", clone: "/git/repo" },
		...overrides,
	};
}

function context(existing: Session[]): {
	ctx: TreeSpawnContext;
	notify: ReturnType<typeof vi.fn>;
} {
	const sessions = new Map(existing.map((s) => [s.id, s]));
	const notify = vi.fn();
	return {
		notify,
		ctx: {
			sessions,
			spawnWith: (create) => {
				const session = create("4");
				sessions.set(session.id, session);
				return session.id;
			},
			notify,
			startHeld: vi.fn(),
		},
	};
}

describe("spawnIntoStream", () => {
	it("adds the agent to the target's workspace without allocating one", () => {
		const stream = target();
		const { ctx, notify } = context([stream]);

		const id = spawnIntoStream(ctx, stream, "help with this", undefined);

		const joined = ctx.sessions.get(id);
		expect(joined?.cwd).toBe("/git/repo-2");
		expect(joined?.worktree).toEqual({
			path: "/git/repo-2",
			clone: "/git/repo",
		});
		expect(notify).toHaveBeenCalled();
	});

	it("starts the added agent straight away when the workspace is ready", () => {
		const stream = target();
		const { ctx } = context([stream]);

		const id = spawnIntoStream(ctx, stream, "go", undefined);

		expect(vi.mocked(createSession).mock.calls[0]?.[5]).toBe(false);
		expect(ctx.sessions.get(id)?.pty).not.toBeNull();
	});

	it("holds the added agent while the target's workspace is still seeding", () => {
		const stream = target({ pty: null, pendingStart: () => null });
		const { ctx } = context([stream]);

		const id = spawnIntoStream(ctx, stream, "go", undefined);

		expect(vi.mocked(createSession).mock.calls.at(-1)?.[5]).toBe(true);
		expect(ctx.sessions.get(id)?.pendingStart).toBeDefined();
	});

	it("shares the clone's own tree when the target was never in a worktree", () => {
		const stream = target({ cwd: "/git/repo", worktree: undefined });
		const { ctx } = context([stream]);

		const id = spawnIntoStream(ctx, stream, "go", undefined);

		expect(ctx.sessions.get(id)?.cwd).toBe("/git/repo");
		expect(ctx.sessions.get(id)?.worktree).toBeUndefined();
	});
});
