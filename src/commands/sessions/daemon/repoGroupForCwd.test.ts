import { beforeEach, describe, expect, it, vi } from "vitest";
import { originForCwd } from "./originForCwd";
import { repoGroupForCwd } from "./repoGroupForCwd";
import { mainWorktree } from "./worktree/listWorktreePaths";
import { worktreeAttributionIncludingReaped } from "./worktree/readWorktreeRegistry";

vi.mock("./originForCwd", () => ({ originForCwd: vi.fn() }));
vi.mock("./worktree/listWorktreePaths", () => ({ mainWorktree: vi.fn() }));
vi.mock("./worktree/readWorktreeRegistry", () => ({
	worktreeAttributionIncludingReaped: vi.fn(),
}));

const origin = vi.mocked(originForCwd);
const clone = vi.mocked(mainWorktree);
const attribution = vi.mocked(worktreeAttributionIncludingReaped);

describe("repoGroupForCwd", () => {
	beforeEach(() => {
		origin.mockReset();
		clone.mockReset();
		attribution.mockReset();
		attribution.mockReturnValue(undefined);
	});

	it("returns undefined without probing when there is no cwd", () => {
		expect(repoGroupForCwd(undefined)).toBeUndefined();
		expect(clone).not.toHaveBeenCalled();
	});

	it("groups a worktree under its clone's origin", () => {
		clone.mockReturnValue("/git/repo-a");
		origin.mockReturnValue("host/org/repo");

		expect(repoGroupForCwd("/git/repo-a-2")).toEqual({
			origin: "host/org/repo",
			clone: "/git/repo-a",
		});
		expect(origin).toHaveBeenCalledWith("/git/repo-a");
	});

	it("attributes a reaped worktree from the registry when git can no longer read it", () => {
		clone.mockReturnValue(null);
		attribution.mockReturnValue({
			clone: "/git/repo-b",
			origin: "host/org/repo",
		});

		expect(repoGroupForCwd("/git/repo-b-3")).toEqual({
			origin: "host/org/repo",
			clone: "/git/repo-b",
		});
	});

	it("reconciles a stale registry origin against the clone's current origin", () => {
		clone.mockImplementation((cwd) => (cwd === "/git/repo-f" ? cwd : null));
		origin.mockReturnValue("host/org/repo-f");
		attribution.mockReturnValue({
			clone: "/git/repo-f",
			origin: "local:/git/repo-f",
		});

		expect(repoGroupForCwd("/git/repo-f-2")).toEqual({
			origin: "host/org/repo-f",
			clone: "/git/repo-f",
		});
	});

	it("returns undefined for a path that is neither a repo nor a known worktree", () => {
		clone.mockReturnValue(null);

		expect(repoGroupForCwd("/tmp/scratch-c")).toBeUndefined();
	});

	it("keeps a windows-host checkout in its own group even on a shared remote", () => {
		clone.mockReturnValue(String.raw`C:\git\repo-d`);
		origin.mockReturnValue("host/org/repo");

		expect(repoGroupForCwd(String.raw`C:\git\repo-d`)).toEqual({
			origin: "windows:host/org/repo",
			clone: String.raw`C:\git\repo-d`,
		});
	});

	it("memoises per cwd so git is only shelled once", () => {
		clone.mockReturnValue("/git/repo-e");
		origin.mockReturnValue("host/org/repo");

		repoGroupForCwd("/git/repo-e");
		repoGroupForCwd("/git/repo-e");

		expect(clone).toHaveBeenCalledTimes(1);
	});
});
