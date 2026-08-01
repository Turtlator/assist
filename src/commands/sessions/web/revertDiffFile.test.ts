import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revertDiffFile } from "./revertDiffFile";
import { revertPathChanges } from "./revertPathChanges";

vi.mock("./revertPathChanges", () => ({ revertPathChanges: vi.fn() }));

const revertPathChangesMock = vi.mocked(revertPathChanges);

async function request(url: string): Promise<{ status: number; body: string }> {
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
	await revertDiffFile({ url } as IncomingMessage, res);
	return { status, body };
}

describe("revertDiffFile", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		revertPathChangesMock.mockResolvedValue();
	});

	it("reverts the requested path, relative to the repo root", async () => {
		const { status } = await request(
			"/api/diff/revert?cwd=%2Frepo&path=src%2Fapp.ts",
		);

		expect(status).toBe(200);
		expect(revertPathChangesMock).toHaveBeenCalledWith("/repo", "src/app.ts");
	});

	it("rejects a request without a cwd", async () => {
		const { status } = await request("/api/diff/revert?path=src%2Fapp.ts");

		expect(status).toBe(400);
		expect(revertPathChangesMock).not.toHaveBeenCalled();
	});

	it("rejects a request without a path", async () => {
		const { status } = await request("/api/diff/revert?cwd=%2Frepo");

		expect(status).toBe(400);
		expect(revertPathChangesMock).not.toHaveBeenCalled();
	});

	it("rejects a path outside the cwd", async () => {
		const { status } = await request(
			"/api/diff/revert?cwd=%2Frepo&path=..%2Fescape.ts",
		);

		expect(status).toBe(400);
		expect(revertPathChangesMock).not.toHaveBeenCalled();
	});

	it("reports a git failure", async () => {
		revertPathChangesMock.mockRejectedValue(
			new Error("pathspec did not match"),
		);

		const { status, body } = await request(
			"/api/diff/revert?cwd=%2Frepo&path=src%2Fapp.ts",
		);

		expect(status).toBe(500);
		expect(body).toContain("pathspec did not match");
	});
});
