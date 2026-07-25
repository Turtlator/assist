import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRespondJson = vi.fn();
const mockExecGit = vi.fn();

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

vi.mock("./execGit", () => ({
	execGit: (...args: unknown[]) => mockExecGit(...args),
}));

import { listFiles } from "./listFiles";

type Body = { files?: string[]; error?: string };

async function request(query: string): Promise<[number, Body]> {
	await listFiles(
		{ url: `/api/files?${query}` } as IncomingMessage,
		{} as ServerResponse,
	);
	const [, status, body] = mockRespondJson.mock.lastCall as [
		ServerResponse,
		number,
		Body,
	];
	return [status, body];
}

describe("listFiles", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockExecGit.mockResolvedValue("src/a.ts\nsrc/b.ts\n");
	});

	it("lists tracked and untracked files honouring .gitignore", async () => {
		const [status, body] = await request("cwd=/repo-honouring");
		expect(status).toBe(200);
		expect(body.files).toEqual(["src/a.ts", "src/b.ts"]);
		expect(mockExecGit).toHaveBeenCalledWith(
			"/repo-honouring",
			["ls-files", "--cached", "--others", "--exclude-standard"],
			expect.anything(),
		);
	});

	it("ranks against the query and caps the results at 20", async () => {
		const many = Array.from({ length: 40 }, (_, i) => `src/file${i}.ts`);
		mockExecGit.mockResolvedValue(many.join("\n"));
		const [, body] = await request("cwd=/repo-capped&q=file");
		expect(body.files).toHaveLength(20);
	});

	it("caches the file list per cwd", async () => {
		await request("cwd=/repo-cached&q=a");
		await request("cwd=/repo-cached&q=b");
		expect(mockExecGit).toHaveBeenCalledTimes(1);
	});

	it("rejects a missing cwd", async () => {
		const [status] = await request("q=a");
		expect(status).toBe(400);
	});

	it("reports a git failure", async () => {
		mockExecGit.mockRejectedValue(new Error("not a repo"));
		const [status, body] = await request("cwd=/repo-failing");
		expect(status).toBe(500);
		expect(body.error).toBe("Failed to list files");
	});
});
