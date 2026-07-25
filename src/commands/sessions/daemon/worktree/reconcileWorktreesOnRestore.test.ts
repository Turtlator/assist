import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import { loadPersistedSessions } from "../loadPersistedSessions";
import { readWorktreeRegistry } from "./readWorktreeRegistry";
import { reapWorktree } from "./reapWorktree";
import { reclaimVanishedWorktrees } from "./reclaimVanishedWorktrees";
import { reconcileWorktreesOnRestore } from "./reconcileWorktreesOnRestore";
import { armStoppedSession } from "./rearmStoppedSessions";
import { checkDurability } from "./treeDurability";

vi.mock("node:fs", () => ({ existsSync: vi.fn(() => true) }));
vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../../../shared/findRepoRoot", () => ({
	findRepoRoot: (cwd: string) => cwd,
}));
vi.mock("../loadPersistedSessions", () => ({
	loadPersistedSessions: vi.fn(() => []),
}));
vi.mock("./bindNewWorktree", () => ({ bindRestoredWorktrees: vi.fn() }));
vi.mock("./readWorktreeRegistry", () => ({ readWorktreeRegistry: vi.fn() }));
vi.mock("./reapWorktree", () => ({
	reapWorktree: vi.fn(() => Promise.resolve(true)),
}));
vi.mock("./reclaimVanishedWorktrees", () => ({
	reclaimVanishedWorktrees: vi.fn(() => Promise.resolve()),
}));
vi.mock("./rearmStoppedSessions", () => ({ armStoppedSession: vi.fn() }));
vi.mock("./treeDurability", () => ({ checkDurability: vi.fn() }));

const existsMock = existsSync as unknown as ReturnType<typeof vi.fn>;
const registryMock = readWorktreeRegistry as unknown as ReturnType<
	typeof vi.fn
>;
const reapMock = reapWorktree as unknown as ReturnType<typeof vi.fn>;
const reclaimMock = reclaimVanishedWorktrees as unknown as ReturnType<
	typeof vi.fn
>;
const armMock = armStoppedSession as unknown as ReturnType<typeof vi.fn>;
const durabilityMock = checkDurability as unknown as ReturnType<typeof vi.fn>;
const persistedMock = loadPersistedSessions as unknown as ReturnType<
	typeof vi.fn
>;

function reconcile(sessions: Map<string, Session>) {
	const spawnWith = (create: (id: string) => Session) => {
		const session = create(String(sessions.size + 1));
		sessions.set(session.id, session);
		return session.id;
	};
	reconcileWorktreesOnRestore(sessions, spawnWith, () => {});
	return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("reconcileWorktreesOnRestore", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsMock.mockReturnValue(true);
		persistedMock.mockReturnValue([]);
		registryMock.mockReturnValue([
			{ path: "/git/repo-2", clone: "/git/repo", origin: "git@x:y.git" },
		]);
	});

	it("resurfaces an undurable orphan as a visible stopped card and never removes it", async () => {
		durabilityMock.mockResolvedValue({
			durable: false,
			reason: "uncommitted changes",
		});
		const sessions = new Map<string, Session>();

		await reconcile(sessions);

		const card = [...sessions.values()][0];
		expect(card?.status).toBe("stopped");
		expect(card?.pty).toBeNull();
		expect(card?.cwd).toBe("/git/repo-2");
		expect(card?.worktree).toEqual({ path: "/git/repo-2", clone: "/git/repo" });
		expect(card?.undurable).toEqual({
			reason: "uncommitted changes",
			removesTree: true,
		});
		expect(reapMock).not.toHaveBeenCalled();
		expect(armMock).toHaveBeenCalledTimes(1);
	});

	it("reaps a durable orphan without leaving a card behind", async () => {
		durabilityMock.mockResolvedValue({ durable: true });
		const sessions = new Map<string, Session>();

		await reconcile(sessions);

		expect(reapMock).toHaveBeenCalledWith("/git/repo-2");
		expect(sessions.size).toBe(0);
	});

	it("leaves a worktree a restored session still holds alone", async () => {
		const held: Session = {
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
		};

		await reconcile(new Map([["1", held]]));

		expect(durabilityMock).not.toHaveBeenCalled();
		expect(reapMock).not.toHaveBeenCalled();
	});

	it("leaves a worktree a persisted session still holds alone", async () => {
		persistedMock.mockReturnValue([{ cwd: "/git/repo-2" }]);

		await reconcile(new Map());

		expect(durabilityMock).not.toHaveBeenCalled();
	});

	it("reclaims the bookkeeping and branch of a worktree already gone from disk", async () => {
		existsMock.mockImplementation((path: string) => path !== "/git/repo-2");

		await reconcile(new Map());

		expect(durabilityMock).not.toHaveBeenCalled();
		expect(reclaimMock).toHaveBeenCalledWith("/git/repo", [
			{ path: "/git/repo-2", branch: "repo-2" },
		]);
	});
});
