import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { git, gitOrNull } from "./git";
import { mainWorktree } from "./listWorktreePaths";
import {
	forgetWorktree,
	worktreeAttributionIncludingReaped,
} from "./readWorktreeRegistry";
import { reapWorktree } from "./reapWorktree";
import { checkDurability } from "./treeDurability";

vi.mock("node:fs", () => ({
	existsSync: vi.fn(() => true),
	statSync: vi.fn(() => undefined),
}));
vi.mock("node:fs/promises", () => ({ rm: vi.fn(() => Promise.resolve()) }));
vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./git", () => ({ git: vi.fn(), gitOrNull: vi.fn() }));
vi.mock("./listWorktreePaths", () => ({
	mainWorktree: vi.fn(() => "/git/repo" as string | null),
	listLocalBranches: vi.fn(() => ["main", "repo-2"]),
}));
vi.mock("./readWorktreeRegistry", () => ({
	forgetWorktree: vi.fn(),
	worktreeAttributionIncludingReaped: vi.fn(() => undefined),
}));
vi.mock("./stopInstall", () => ({ stopInstall: vi.fn() }));
vi.mock("./treeDurability", () => ({ checkDurability: vi.fn() }));

const existsMock = existsSync as unknown as ReturnType<typeof vi.fn>;
const rmMock = rm as unknown as ReturnType<typeof vi.fn>;
const gitMock = git as unknown as ReturnType<typeof vi.fn>;
const gitOrNullMock = gitOrNull as unknown as ReturnType<typeof vi.fn>;
const forgetMock = forgetWorktree as unknown as ReturnType<typeof vi.fn>;
const durabilityMock = checkDurability as unknown as ReturnType<typeof vi.fn>;
const mainWorktreeMock = mainWorktree as unknown as ReturnType<typeof vi.fn>;
const attributionMock =
	worktreeAttributionIncludingReaped as unknown as ReturnType<typeof vi.fn>;

function gitCalls(): string[][] {
	return gitMock.mock.calls.map((call) => call[1] as string[]);
}

function gitClones(): string[] {
	return gitMock.mock.calls.map((call) => call[0] as string);
}

function strandedTree(): void {
	existsMock.mockImplementation((path: string) => path !== "/git/repo-2/.git");
	gitMock.mockImplementation((_cwd: string, args: string[]) =>
		args[1] === "remove"
			? Promise.reject(
					new Error(
						args.includes("--force")
							? "fatal: 'repo-2' is not a working tree"
							: "error: failed to delete 'repo-2': Directory not empty",
					),
				)
			: Promise.resolve(""),
	);
}

describe("reapWorktree", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsMock.mockReturnValue(true);
		rmMock.mockResolvedValue(undefined);
		mainWorktreeMock.mockReturnValue("/git/repo");
		attributionMock.mockReturnValue(undefined);
		gitMock.mockResolvedValue("");
		gitOrNullMock.mockImplementation((cwd: string) =>
			Promise.resolve(cwd === "/git/repo" ? "main" : "repo-2"),
		);
		durabilityMock.mockResolvedValue({ durable: true });
	});

	it("removes a durable tree, deletes its branch and forgets the record", async () => {
		expect(await reapWorktree("/git/repo-2")).toBe(true);

		expect(gitCalls()).toContainEqual(["worktree", "remove", "/git/repo-2"]);
		expect(gitCalls()).toContainEqual(["branch", "-D", "repo-2"]);
		expect(forgetMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("leaves the session's own feature branch alone, deleting only the worktree branch", async () => {
		gitOrNullMock.mockImplementation((cwd: string) =>
			Promise.resolve(cwd === "/git/repo" ? "main" : "feat/thing"),
		);

		expect(await reapWorktree("/git/repo-2")).toBe(true);

		expect(gitCalls()).toContainEqual(["branch", "-D", "repo-2"]);
		expect(gitCalls()).not.toContainEqual(["branch", "-D", "feat/thing"]);
	});

	it("never touches an undurable tree and keeps its record for recovery", async () => {
		durabilityMock.mockResolvedValue({
			durable: false,
			reason: "uncommitted changes",
		});

		expect(await reapWorktree("/git/repo-2")).toBe(false);

		expect(gitMock).not.toHaveBeenCalled();
		expect(forgetMock).not.toHaveBeenCalled();
	});

	it("retries removal forcefully once the work is proven landed", async () => {
		gitMock.mockImplementation((_cwd: string, args: string[]) =>
			args[1] === "remove" && !args.includes("--force")
				? Promise.reject(new Error("contains untracked files"))
				: Promise.resolve(""),
		);

		expect(await reapWorktree("/git/repo-2")).toBe(true);

		expect(gitCalls()).toContainEqual([
			"worktree",
			"remove",
			"--force",
			"/git/repo-2",
		]);
		expect(forgetMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("keeps the record when removal fails outright so the next reconcile retries", async () => {
		gitMock.mockRejectedValue(new Error("worktree is locked"));

		expect(await reapWorktree("/git/repo-2")).toBe(false);

		expect(rmMock).not.toHaveBeenCalled();
		expect(forgetMock).not.toHaveBeenCalled();
	});

	it("deletes the directory itself once git has lost the tree, then prunes, deletes the branch and forgets it", async () => {
		strandedTree();

		expect(await reapWorktree("/git/repo-2")).toBe(true);

		expect(rmMock).toHaveBeenCalledWith(
			"/git/repo-2",
			expect.objectContaining({ recursive: true, force: true }),
		);
		expect(gitCalls()).toContainEqual(["worktree", "prune"]);
		expect(gitCalls()).toContainEqual(["branch", "-D", "repo-2"]);
		expect(forgetMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("forgets a discarded stranded tree even when every git command fails", async () => {
		existsMock.mockImplementation(
			(path: string) => path !== "/git/repo-2/.git",
		);
		gitMock.mockRejectedValue(
			new Error("fatal: 'repo-2' is not a working tree"),
		);

		expect(await reapWorktree("/git/repo-2", true)).toBe(true);

		expect(rmMock).toHaveBeenCalled();
		expect(forgetMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("forgets a discarded tree git refuses to remove for a reason of its own", async () => {
		gitMock.mockImplementation((_cwd: string, args: string[]) =>
			args[1] === "remove"
				? Promise.reject(new Error("fatal: 'repo-2' is locked"))
				: Promise.resolve(""),
		);

		expect(await reapWorktree("/git/repo-2", true)).toBe(true);

		expect(rmMock).toHaveBeenCalled();
		expect(forgetMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("keeps the record when even the direct directory delete fails", async () => {
		strandedTree();
		rmMock.mockRejectedValue(new Error("EBUSY: resource busy or locked"));

		expect(await reapWorktree("/git/repo-2")).toBe(false);

		expect(forgetMock).not.toHaveBeenCalled();
	});

	it("prunes against the recorded clone when git can no longer name it", async () => {
		strandedTree();
		mainWorktreeMock.mockReturnValue(null);
		attributionMock.mockReturnValue({
			clone: "/git/repo",
			origin: "git@host:o/r.git",
		});

		expect(await reapWorktree("/git/repo-2")).toBe(true);

		expect(gitClones()).toContain("/git/repo");
		expect(gitClones()).not.toContain("/git/repo-2");
	});

	it("skips a tree already gone from disk", async () => {
		existsMock.mockReturnValue(false);

		expect(await reapWorktree("/git/repo-2")).toBe(false);

		expect(gitMock).not.toHaveBeenCalled();
	});
});
