import { beforeEach, describe, expect, it, vi } from "vitest";
import { gitSyncOrNull } from "../sessions/daemon/worktree/git";
import { worktreeHoldingBranch } from "./worktreeHoldingBranch";

vi.mock("../sessions/daemon/worktree/git", () => ({
	gitSyncOrNull: vi.fn(),
}));

const gitMock = vi.mocked(gitSyncOrNull);

const listing = [
	"worktree /git/repo",
	"HEAD 1111111111111111111111111111111111111111",
	"branch refs/heads/feature",
	"",
	"worktree /git/repo-2",
	"HEAD 2222222222222222222222222222222222222222",
	"branch refs/heads/repo-2",
	"",
	"worktree /git/repo-3",
	"HEAD 3333333333333333333333333333333333333333",
	"detached",
].join("\n");

function respond(toplevel: string): void {
	gitMock.mockImplementation((_cwd, args) =>
		args[0] === "worktree" ? listing : toplevel,
	);
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("worktreeHoldingBranch", () => {
	it("finds the worktree that has the branch checked out", () => {
		respond("/git/repo-2");

		expect(worktreeHoldingBranch("/git/repo-2", "feature")).toBe("/git/repo");
	});

	it("ignores the branch when the current tree is the one holding it", () => {
		respond("/git/repo");

		expect(worktreeHoldingBranch("/git/repo", "feature")).toBeNull();
	});

	it("returns null when no tree holds the branch", () => {
		respond("/git/repo");

		expect(worktreeHoldingBranch("/git/repo", "other")).toBeNull();
	});

	it("returns null when the listing is unavailable", () => {
		gitMock.mockReturnValue(null);

		expect(worktreeHoldingBranch("/git/repo", "feature")).toBeNull();
	});
});
