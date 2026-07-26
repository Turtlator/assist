import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { diff } from "./diff";
import { execGit } from "./execGit";
import { itemChangeSet } from "./itemChangeSet";

vi.mock("./execGit", () => ({ execGit: vi.fn() }));
vi.mock("./itemChangeSet", () => ({ itemChangeSet: vi.fn() }));

const execGitMock = vi.mocked(execGit);
const itemChangeSetMock = vi.mocked(itemChangeSet);

function withGit(responder: (args: string[]) => string): void {
	execGitMock.mockImplementation(async (_cwd, args) => responder(args));
}

async function request(url = "/api/diff?cwd=%2Frepo"): Promise<{
	status: number;
	body: string;
}> {
	let status = 0;
	let body = "";
	const res = {
		writeHead: (code: number) => {
			status = code;
		},
		end: (chunk?: string) => {
			body = chunk ?? "";
		},
	} as unknown as ServerResponse;
	await diff({ url } as IncomingMessage, res);
	return { status, body };
}

describe("diff", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		itemChangeSetMock.mockResolvedValue(undefined);
	});

	it("rejects a request without a cwd", async () => {
		const { status } = await request("/api/diff");
		expect(status).toBe(400);
		expect(execGitMock).not.toHaveBeenCalled();
	});

	it("diffs the working tree against HEAD when there is no change set", async () => {
		withGit((args) => (args[0] === "diff" ? "tracked patch\n" : ""));

		const { status, body } = await request();

		expect(status).toBe(200);
		expect(body).toBe("tracked patch\n");
		expect(execGitMock).toHaveBeenCalledWith("/repo", ["diff", "HEAD"], {
			maxBuffer: 50 * 1024 * 1024,
		});
	});

	it("appends a patch for every untracked file", async () => {
		withGit((args) => {
			if (args[0] === "ls-files") return "added.ts\n";
			if (args.includes("--no-index")) return "untracked patch\n";
			return "tracked patch\n";
		});

		const { body } = await request();

		expect(body).toBe("tracked patch\nuntracked patch\n");
		expect(execGitMock).toHaveBeenCalledWith(
			"/repo",
			["diff", "--no-index", "--", "/dev/null", "added.ts"],
			{ maxBuffer: 50 * 1024 * 1024, allowFailure: true },
		);
	});

	it("concatenates one diff per change-set group", async () => {
		itemChangeSetMock.mockResolvedValue({
			commits: [{ sha: "one" }],
			groups: [
				{ base: "base-one", paths: ["a.ts", "b.ts"] },
				{ base: "HEAD", paths: ["z.ts"] },
			],
		});
		withGit((args) => (args[0] === "diff" ? `${args[1]} patch\n` : ""));

		const { body } = await request();

		expect(body).toBe("base-one patch\nHEAD patch\n");
		expect(execGitMock).toHaveBeenCalledWith(
			"/repo",
			["diff", "base-one", "--", "a.ts", "b.ts"],
			{ maxBuffer: 50 * 1024 * 1024 },
		);
		expect(execGitMock).toHaveBeenCalledWith(
			"/repo",
			["diff", "HEAD", "--", "z.ts"],
			{ maxBuffer: 50 * 1024 * 1024 },
		);
	});

	it("resolves the change set for the requested session", async () => {
		withGit(() => "");

		await request("/api/diff?cwd=%2Frepo&session=sess-1");

		expect(itemChangeSetMock).toHaveBeenCalledWith("/repo", "sess-1");
	});

	it("returns an empty body when git fails", async () => {
		execGitMock.mockRejectedValue(new Error("not a repo"));

		const { status, body } = await request();

		expect(status).toBe(500);
		expect(body).toBe("");
	});
});
