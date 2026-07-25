import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { git, gitOrNull } from "./git";
import { forgetWorktree } from "./readWorktreeRegistry";
import { reapWorktree } from "./reapWorktree";
import { checkDurability } from "./treeDurability";

vi.mock("node:fs", () => ({ existsSync: vi.fn(() => true) }));
vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./git", () => ({ git: vi.fn(), gitOrNull: vi.fn() }));
vi.mock("./listWorktreePaths", () => ({ mainWorktree: () => "/git/repo" }));
vi.mock("./readWorktreeRegistry", () => ({ forgetWorktree: vi.fn() }));
vi.mock("./treeDurability", () => ({ checkDurability: vi.fn() }));

const existsMock = existsSync as unknown as ReturnType<typeof vi.fn>;
const gitMock = git as unknown as ReturnType<typeof vi.fn>;
const gitOrNullMock = gitOrNull as unknown as ReturnType<typeof vi.fn>;
const forgetMock = forgetWorktree as unknown as ReturnType<typeof vi.fn>;
const durabilityMock = checkDurability as unknown as ReturnType<typeof vi.fn>;

function gitCalls(): string[][] {
	return gitMock.mock.calls.map((call) => call[1] as string[]);
}

describe("reapWorktree", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsMock.mockReturnValue(true);
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

		expect(forgetMock).not.toHaveBeenCalled();
	});

	it("skips a tree already gone from disk", async () => {
		existsMock.mockReturnValue(false);

		expect(await reapWorktree("/git/repo-2")).toBe(false);

		expect(gitMock).not.toHaveBeenCalled();
	});
});
