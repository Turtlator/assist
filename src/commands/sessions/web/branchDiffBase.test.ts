import { beforeEach, describe, expect, it, vi } from "vitest";
import { branchDiffBase } from "./branchDiffBase";
import { defaultBranchRef } from "./defaultBranchRef";
import { execGit } from "./execGit";

vi.mock("./execGit", () => ({ execGit: vi.fn() }));
vi.mock("./defaultBranchRef", () => ({ defaultBranchRef: vi.fn() }));

const execGitMock = vi.mocked(execGit);
const defaultBranchRefMock = vi.mocked(defaultBranchRef);

function gitArgs(): string[][] {
	return execGitMock.mock.calls.map(([, args]) => args);
}

describe("branchDiffBase", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		defaultBranchRefMock.mockResolvedValue("origin/main");
		execGitMock.mockResolvedValue("base-sha\n");
	});

	it("returns the merge base with the default branch", async () => {
		expect(await branchDiffBase("/repo")).toBe("base-sha");
		expect(gitArgs()).toEqual([["merge-base", "origin/main", "HEAD"]]);
	});

	it("returns undefined when no default branch ref resolves", async () => {
		defaultBranchRefMock.mockResolvedValue(undefined);

		expect(await branchDiffBase("/repo")).toBeUndefined();
		expect(execGitMock).not.toHaveBeenCalled();
	});

	it("returns undefined when no merge base exists", async () => {
		execGitMock.mockResolvedValue("");

		expect(await branchDiffBase("/repo")).toBeUndefined();
	});

	it("returns undefined when the merge base lookup fails", async () => {
		execGitMock.mockRejectedValue(new Error("git merge-base failed"));

		expect(await branchDiffBase("/repo")).toBeUndefined();
	});

	it("resolves the base without fetching", async () => {
		await branchDiffBase("/repo");

		expect(gitArgs().some((args) => args[0] === "fetch")).toBe(false);
	});
});
