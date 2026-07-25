import { describe, expect, it, vi } from "vitest";
import type { SessionManager } from "./SessionManager";
import { spawnCreate } from "./spawnCreate";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function manager(joined: string | undefined) {
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
		const m = manager(undefined);

		expect(spawnCreate(m, { prompt: "go", cwd: "/git/repo" })).toBe("9");
		expect(m.addAgent).not.toHaveBeenCalled();
		expect(m.spawn).toHaveBeenCalledWith("go", "/git/repo", false, undefined);
	});

	it("adds an agent to the named stream instead of allocating a workspace", () => {
		const m = manager("4");

		const id = spawnCreate(m, {
			prompt: "go",
			cwd: "/git/repo-2",
			joinSessionId: "3",
		});

		expect(id).toBe("4");
		expect(m.addAgent).toHaveBeenCalledWith("3", "go", undefined);
		expect(m.spawn).not.toHaveBeenCalled();
	});

	it("falls back to a fresh session when the stream can no longer take one", () => {
		const m = manager(undefined);

		expect(
			spawnCreate(m, { prompt: "go", cwd: "/git/repo-2", joinSessionId: "3" }),
		).toBe("9");
		expect(m.spawn).toHaveBeenCalledWith("go", "/git/repo-2", false, undefined);
	});
});
