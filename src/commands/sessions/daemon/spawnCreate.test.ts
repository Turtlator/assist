import { describe, expect, it, vi } from "vitest";
import type { SessionManager } from "./SessionManager";
import { spawnCreate } from "./spawnCreate";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function manager(joined: { sessionId: string } | { reason: string }) {
	return {
		spawn: vi.fn(() => "9"),
		addAgent: vi.fn(() => joined),
	} as unknown as SessionManager & {
		spawn: ReturnType<typeof vi.fn>;
		addAgent: ReturnType<typeof vi.fn>;
	};
}

describe("spawnCreate", () => {
	it("starts a fresh isolated session by default", () => {
		const m = manager({ reason: "no such session" });

		expect(spawnCreate(m, { prompt: "go", cwd: "/git/repo" })).toBe("9");
		expect(m.addAgent).not.toHaveBeenCalled();
		expect(m.spawn).toHaveBeenCalledWith(
			{
				prompt: "go",
				cwd: "/git/repo",
				design: false,
				harness: undefined,
				inPlace: false,
			},
			{ launchedFrom: undefined },
		);
	});

	it("adds an agent to the named stream instead of allocating a workspace", () => {
		const m = manager({ sessionId: "4" });

		const id = spawnCreate(m, {
			prompt: "go",
			cwd: "/git/repo-2",
			joinSessionId: "3",
		});

		expect(id).toBe("4");
		expect(m.addAgent).toHaveBeenCalledWith("3", "go", undefined);
		expect(m.spawn).not.toHaveBeenCalled();
	});

	it("reports a refused join instead of spawning somewhere else", () => {
		const m = manager({ reason: "the session's workspace no longer exists" });

		expect(
			spawnCreate(m, { prompt: "go", cwd: "/git/repo-2", joinSessionId: "3" }),
		).toEqual({
			error: "Can't add an agent: the session's workspace no longer exists.",
		});
		expect(m.spawn).not.toHaveBeenCalled();
	});

	it("ignores the join target for a design session", () => {
		const m = manager({ reason: "no such session" });

		expect(
			spawnCreate(m, { cwd: "/git/repo", joinSessionId: "3", design: true }),
		).toBe("9");
		expect(m.addAgent).not.toHaveBeenCalled();
	});
});
