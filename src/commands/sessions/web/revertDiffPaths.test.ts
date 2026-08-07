import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revertDiffPaths } from "./revertDiffPaths";
import { revertPathChanges } from "./revertPathChanges";

vi.mock("./revertPathChanges", () => ({ revertPathChanges: vi.fn() }));

const revertPathChangesMock = vi.mocked(revertPathChanges);

async function request(
	query: string,
	body: unknown,
): Promise<{ status: number; body: Record<string, unknown> }> {
	const req = Readable.from([
		Buffer.from(typeof body === "string" ? body : JSON.stringify(body)),
	]) as unknown as IncomingMessage;
	req.url = `/api/diff/revert-all?${query}`;

	let status = 0;
	let payload = "";
	const res = {
		writeHead: (code: number) => {
			status = code;
		},
		end: (chunk?: string) => {
			payload = chunk ?? "";
		},
	} as unknown as ServerResponse;

	await revertDiffPaths(req, res);
	return { status, body: payload ? JSON.parse(payload) : {} };
}

describe("revertDiffPaths", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		revertPathChangesMock.mockResolvedValue();
	});

	it("reverts every requested path relative to the repo root", async () => {
		const { status, body } = await request("cwd=%2Frepo", {
			paths: ["src/app.ts", "src/web/ui.ts"],
		});

		expect(status).toBe(200);
		expect(body.reverted).toEqual(["src/app.ts", "src/web/ui.ts"]);
		expect(body.failed).toEqual([]);
		expect(revertPathChangesMock).toHaveBeenCalledTimes(2);
		expect(revertPathChangesMock).toHaveBeenCalledWith("/repo", "src/app.ts");
	});

	it("reverts the remaining paths when one fails", async () => {
		revertPathChangesMock.mockImplementation((_cwd, path) =>
			path === "src/bad.ts"
				? Promise.reject(new Error("pathspec did not match"))
				: Promise.resolve(),
		);

		const { status, body } = await request("cwd=%2Frepo", {
			paths: ["src/app.ts", "src/bad.ts", "src/other.ts"],
		});

		expect(status).toBe(200);
		expect(body.reverted).toEqual(["src/app.ts", "src/other.ts"]);
		expect(body.failed).toEqual([
			{ path: "src/bad.ts", error: "pathspec did not match" },
		]);
	});

	it("reports a path escaping the repo without reverting it", async () => {
		const { status, body } = await request("cwd=%2Frepo", {
			paths: ["../escape.ts", "src/app.ts"],
		});

		expect(status).toBe(200);
		expect(body.reverted).toEqual(["src/app.ts"]);
		expect(body.failed).toEqual([
			{ path: "../escape.ts", error: "Path outside cwd" },
		]);
		expect(revertPathChangesMock).toHaveBeenCalledOnce();
	});

	it("rejects a request without a cwd", async () => {
		const { status } = await request("", { paths: ["src/app.ts"] });

		expect(status).toBe(400);
		expect(revertPathChangesMock).not.toHaveBeenCalled();
	});

	it("rejects a body without a path list", async () => {
		const { status } = await request("cwd=%2Frepo", { paths: "src/app.ts" });

		expect(status).toBe(400);
		expect(revertPathChangesMock).not.toHaveBeenCalled();
	});

	it("rejects an unparseable body", async () => {
		const { status } = await request("cwd=%2Frepo", "not json");

		expect(status).toBe(400);
		expect(revertPathChangesMock).not.toHaveBeenCalled();
	});
});
