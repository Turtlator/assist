import {
	mkdirSync,
	mkdtempSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const mockRespondJson = vi.fn();

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

import { fileContent } from "./fileContent";

const root = mkdtempSync(join(tmpdir(), "assist-file-content-"));
writeFileSync(join(root, "README.md"), "# Title\n");
mkdirSync(join(root, "docs"));

afterAll(() => {
	rmSync(root, { recursive: true, force: true });
});

async function request(
	query: string,
): Promise<[number, Record<string, unknown>]> {
	await fileContent(
		{ url: `/api/file?${query}` } as IncomingMessage,
		{} as ServerResponse,
	);
	const [, status, body] = mockRespondJson.mock.lastCall as [
		ServerResponse,
		number,
		Record<string, unknown>,
	];
	return [status, body];
}

function cwdParam(): string {
	return `cwd=${encodeURIComponent(root)}`;
}

describe("fileContent", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the working-tree file text", async () => {
		const [status, body] = await request(`${cwdParam()}&path=README.md`);
		expect(status).toBe(200);
		expect(body.content).toBe("# Title\n");
	});

	it("returns the file's modification time", async () => {
		const [, body] = await request(`${cwdParam()}&path=README.md`);
		expect(body.mtimeMs).toBe(statSync(join(root, "README.md")).mtimeMs);
	});

	it("rejects a request without a path", async () => {
		const [status] = await request(cwdParam());
		expect(status).toBe(400);
	});

	it("rejects a relative path that escapes the cwd", async () => {
		const [status, body] = await request(`${cwdParam()}&path=../outside.md`);
		expect(status).toBe(400);
		expect(body.error).toBe("Path outside cwd");
	});

	it("rejects an absolute path outside the cwd", async () => {
		const [status] = await request(
			`${cwdParam()}&path=${encodeURIComponent("/etc/hosts")}`,
		);
		expect(status).toBe(400);
	});

	it("returns 404 for a missing file", async () => {
		const [status, body] = await request(`${cwdParam()}&path=nope.md`);
		expect(status).toBe(404);
		expect(body.error).toBe("File not found");
	});

	it("returns 404 when the path is a directory", async () => {
		const [status] = await request(`${cwdParam()}&path=docs`);
		expect(status).toBe(404);
	});

	it("rejects a missing cwd", async () => {
		const [status] = await request("path=README.md");
		expect(status).toBe(400);
	});
});
