import { beforeEach, describe, expect, it, vi } from "vitest";
import { allocateAndBind } from "./allocateAndBind";
import { ensureWatcher } from "./ensureWatcher";
import { spawnAssistInTree, type TreeSpawnContext } from "./spawnInTree";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./ensureWatcher", () => ({ ensureWatcher: vi.fn() }));
vi.mock("./allocateAndBind", () => ({ allocateAndBind: vi.fn(() => "4") }));
vi.mock("../createAssistSession", () => ({ createAssistSession: vi.fn() }));

function context(): TreeSpawnContext {
	return {
		sessions: new Map(),
		spawnWith: vi.fn(() => "4"),
		notify: vi.fn(),
		startHeld: vi.fn(),
	};
}

describe("spawnAssistInTree", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(allocateAndBind).mockReturnValue("4");
	});

	it("ensures a watcher for the clone a backlog run was launched against", () => {
		const ctx = context();

		const id = spawnAssistInTree(
			ctx,
			["backlog", "run", "a825"],
			"/git/repo",
			undefined,
		);

		expect(id).toBe("4");
		expect(ensureWatcher).toHaveBeenCalledWith(ctx, "/git/repo", "4");
	});

	it("forwards the launching card to the spawn choke point", () => {
		spawnAssistInTree(context(), ["review", "42"], "/git/repo", undefined, {
			launchedFrom: "2",
		});

		expect(allocateAndBind).toHaveBeenCalledWith(
			expect.anything(),
			"/git/repo",
			expect.any(Function),
			expect.anything(),
			{ launchedFrom: "2" },
		);
	});

	it("ensures no watcher for a command that is not a backlog run", () => {
		spawnAssistInTree(
			context(),
			["backlog", "view", "a825"],
			"/git/repo",
			undefined,
		);

		expect(ensureWatcher).not.toHaveBeenCalled();
	});

	it("ensures no watcher for a pr checkout", () => {
		spawnAssistInTree(context(), ["review", "412"], "/git/repo", undefined);

		expect(ensureWatcher).not.toHaveBeenCalled();
	});
});
