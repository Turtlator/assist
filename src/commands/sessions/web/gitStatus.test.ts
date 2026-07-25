import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { respondJson } from "../../../shared/web";
import { execGit } from "./execGit";
import { gitStatus } from "./gitStatus";
import type { GitStatusCounts } from "./parseGitStatus";
import { resolveDiffBase } from "./resolveDiffBase";

vi.mock("../../../shared/web", () => ({ respondJson: vi.fn() }));
vi.mock("./execGit", () => ({ execGit: vi.fn() }));
vi.mock("./resolveDiffBase", () => ({ resolveDiffBase: vi.fn() }));

const respondJsonMock = vi.mocked(respondJson);
const execGitMock = vi.mocked(execGit);
const resolveDiffBaseMock = vi.mocked(resolveDiffBase);

function withGit(responder: (args: string[]) => string): void {
	execGitMock.mockImplementation(async (_cwd, args) => responder(args));
}

async function request(url = "/api/git-status?cwd=%2Frepo"): Promise<{
	status: number;
	counts: GitStatusCounts;
}> {
	await gitStatus({ url } as IncomingMessage, {} as ServerResponse);
	const [, status, counts] = respondJsonMock.mock.lastCall as [
		ServerResponse,
		number,
		GitStatusCounts,
	];
	return { status, counts };
}

describe("gitStatus", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects a request without a cwd", async () => {
		const { status } = await request("/api/git-status");
		expect(status).toBe(400);
		expect(execGitMock).not.toHaveBeenCalled();
	});

	it("reads the working tree from git status when the base is HEAD", async () => {
		resolveDiffBaseMock.mockResolvedValue("HEAD");
		withGit(() => "?? added.ts\n M changed.ts\n D gone.ts\n");

		const { status, counts } = await request();

		expect(status).toBe(200);
		expect(counts).toEqual({
			new: ["added.ts"],
			modified: ["changed.ts"],
			deleted: ["gone.ts"],
		});
		expect(execGitMock).toHaveBeenCalledExactlyOnceWith("/repo", [
			"status",
			"--porcelain",
			"--untracked-files=all",
		]);
	});

	it("diffs against the base when it is not HEAD", async () => {
		resolveDiffBaseMock.mockResolvedValue("deadbeef");
		withGit((args) => {
			if (args[0] === "diff") return "A\tcommitted.ts\nM\tedited.ts\n";
			return "";
		});

		const { status, counts } = await request();

		expect(status).toBe(200);
		expect(counts).toEqual({
			new: ["committed.ts"],
			modified: ["edited.ts"],
			deleted: [],
		});
		expect(execGitMock).toHaveBeenCalledWith("/repo", [
			"diff",
			"--name-status",
			"deadbeef",
		]);
	});

	it("adds untracked files to the branch counts", async () => {
		resolveDiffBaseMock.mockResolvedValue("deadbeef");
		withGit((args) => {
			if (args[0] === "diff") return "M\ttracked.ts\n";
			return "untracked-a.ts\nuntracked-b.ts\n";
		});

		const { counts } = await request();

		expect(counts).toEqual({
			new: ["untracked-a.ts", "untracked-b.ts"],
			modified: ["tracked.ts"],
			deleted: [],
		});
		expect(execGitMock).toHaveBeenCalledWith("/repo", [
			"ls-files",
			"--others",
			"--exclude-standard",
		]);
	});

	it("counts a file committed then modified again once", async () => {
		resolveDiffBaseMock.mockResolvedValue("deadbeef");
		withGit((args) => (args[0] === "diff" ? "M\ttwice.ts\n" : ""));

		const { counts } = await request();

		expect(counts.modified).toEqual(["twice.ts"]);
		expect(counts.new).toEqual([]);
	});

	it("resolves the base for the requested session", async () => {
		resolveDiffBaseMock.mockResolvedValue("HEAD");
		withGit(() => "");

		await request("/api/git-status?cwd=%2Frepo&session=sess-1");

		expect(resolveDiffBaseMock).toHaveBeenCalledWith("/repo", "sess-1");
	});

	it("resolves the base without a session when none is given", async () => {
		resolveDiffBaseMock.mockResolvedValue("HEAD");
		withGit(() => "");

		await request();

		expect(resolveDiffBaseMock).toHaveBeenCalledWith("/repo", undefined);
	});

	it("returns empty groups when git fails", async () => {
		resolveDiffBaseMock.mockResolvedValue("HEAD");
		execGitMock.mockRejectedValue(new Error("not a repo"));

		const { status, counts } = await request();

		expect(status).toBe(200);
		expect(counts).toEqual({ new: [], modified: [], deleted: [] });
	});
});
