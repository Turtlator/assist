import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultBranchRef } from "./defaultBranchRef";
import { execGit } from "./execGit";
import { gitBranchInfo } from "./gitBranchInfo";

vi.mock("./execGit", () => ({ execGit: vi.fn() }));
vi.mock("./defaultBranchRef", () => ({ defaultBranchRef: vi.fn() }));

const execGitMock = vi.mocked(execGit);
const defaultBranchRefMock = vi.mocked(defaultBranchRef);

let nextCwd = 0;

function cwd(): string {
	nextCwd += 1;
	return `/git/repo-${nextCwd}`;
}

function withBranch(branch: string | Error, defaultRef?: string): void {
	execGitMock.mockImplementation(async () => {
		if (branch instanceof Error) throw branch;
		return `${branch}\n`;
	});
	defaultBranchRefMock.mockResolvedValue(defaultRef);
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("gitBranchInfo", () => {
	it("reports a feature branch as off the default", async () => {
		withBranch("feature/x", "origin/main");

		expect(await gitBranchInfo(cwd())).toEqual({
			branch: "feature/x",
			defaultBranch: "origin/main",
			onDefaultBranch: false,
		});
	});

	it("reports the default branch as on the default", async () => {
		withBranch("main", "origin/main");

		expect(await gitBranchInfo(cwd())).toEqual({
			branch: "main",
			defaultBranch: "origin/main",
			onDefaultBranch: true,
		});
	});

	it("matches the default branch by its remote ref", async () => {
		withBranch("develop", "origin/develop");

		expect((await gitBranchInfo(cwd())).onDefaultBranch).toBe(true);
	});

	it("treats a detached head as having no branch", async () => {
		withBranch("HEAD", "origin/main");

		expect(await gitBranchInfo(cwd())).toEqual({
			branch: null,
			defaultBranch: "origin/main",
			onDefaultBranch: false,
		});
	});

	it("survives a repo with no resolvable default branch", async () => {
		withBranch("feature/x", undefined);

		expect(await gitBranchInfo(cwd())).toEqual({
			branch: "feature/x",
			defaultBranch: null,
			onDefaultBranch: false,
		});
	});

	it("survives git failing outright", async () => {
		withBranch(new Error("not a repo"), undefined);

		expect(await gitBranchInfo(cwd())).toEqual({
			branch: null,
			defaultBranch: null,
			onDefaultBranch: false,
		});
	});

	it("asks git for the branch once per cwd within the cache window", async () => {
		withBranch("feature/x", "origin/main");
		const repo = cwd();

		await gitBranchInfo(repo);
		await gitBranchInfo(repo);

		expect(execGitMock).toHaveBeenCalledTimes(1);
		expect(defaultBranchRefMock).toHaveBeenCalledTimes(1);
	});

	it("caches per working directory", async () => {
		withBranch("feature/x", "origin/main");

		await gitBranchInfo(cwd());
		await gitBranchInfo(cwd());

		expect(execGitMock).toHaveBeenCalledTimes(2);
	});
});
