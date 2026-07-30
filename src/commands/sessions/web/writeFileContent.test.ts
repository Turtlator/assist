import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Readable } from "node:stream";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const mockRespondJson = vi.fn();

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

import { writeFileContent } from "./writeFileContent";

const root = mkdtempSync(join(tmpdir(), "assist-file-write-"));
mkdirSync(join(root, "node_modules"));
symlinkSync(
	resolve("node_modules/oxfmt"),
	join(root, "node_modules", "oxfmt"),
	"dir",
);

afterAll(() => {
	rmSync(root, { recursive: true, force: true });
});

function request(
	query: string,
	body: unknown,
): Promise<[number, Record<string, string>]> {
	const req = Readable.from([
		Buffer.from(JSON.stringify(body)),
	]) as unknown as IncomingMessage;
	req.url = `/api/file?${query}`;
	return writeFileContent(req, {} as ServerResponse).then(() => {
		const [, status, payload] = mockRespondJson.mock.lastCall as [
			ServerResponse,
			number,
			Record<string, string>,
		];
		return [status, payload];
	});
}

function cwdParam(): string {
	return `cwd=${encodeURIComponent(root)}`;
}

describe("writeFileContent", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("formats a written typescript file with oxfmt", async () => {
		const [status, body] = await request(`${cwdParam()}&path=a.ts`, {
			content: "const  x   =1\n",
		});
		expect(status).toBe(200);
		expect(body.content).toBe("const x = 1;\n");
		expect(readFileSync(join(root, "a.ts"), "utf8")).toBe("const x = 1;\n");
	});

	it("writes a file oxfmt does not handle verbatim", async () => {
		const [status, body] = await request(`${cwdParam()}&path=notes.txt`, {
			content: "plain   text\n",
		});
		expect(status).toBe(200);
		expect(body.content).toBe("plain   text\n");
		expect(readFileSync(join(root, "notes.txt"), "utf8")).toBe(
			"plain   text\n",
		);
	});

	it("rejects a relative path that escapes the cwd without writing", async () => {
		const [status, body] = await request(`${cwdParam()}&path=../escaped.ts`, {
			content: "const  x   =1\n",
		});
		expect(status).toBe(400);
		expect(body.error).toBe("Path outside cwd");
		expect(existsSync(join(root, "..", "escaped.ts"))).toBe(false);
	});

	it("rejects an absolute path outside the cwd", async () => {
		const outside = join(root, "..", "absolute-escape.ts");
		const [status] = await request(
			`${cwdParam()}&path=${encodeURIComponent(outside)}`,
			{ content: "const x = 1;\n" },
		);
		expect(status).toBe(400);
		expect(existsSync(outside)).toBe(false);
	});

	it("leaves the file untouched when the body has no content", async () => {
		writeFileSync(join(root, "kept.ts"), "const kept = 1;\n");
		const [status] = await request(`${cwdParam()}&path=kept.ts`, {});
		expect(status).toBe(400);
		expect(readFileSync(join(root, "kept.ts"), "utf8")).toBe(
			"const kept = 1;\n",
		);
	});

	it("rejects a request without a path", async () => {
		const [status] = await request(cwdParam(), { content: "x\n" });
		expect(status).toBe(400);
	});

	it("rejects a missing cwd", async () => {
		const [status] = await request("path=a.ts", { content: "x\n" });
		expect(status).toBe(400);
	});
});
