import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	statSync,
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
): Promise<[number, Record<string, unknown>]> {
	const req = Readable.from([
		Buffer.from(JSON.stringify(body)),
	]) as unknown as IncomingMessage;
	req.url = `/api/file?${query}`;
	return writeFileContent(req, {} as ServerResponse).then(() => {
		const [, status, payload] = mockRespondJson.mock.lastCall as [
			ServerResponse,
			number,
			Record<string, unknown>,
		];
		return [status, payload];
	});
}

function cwdParam(): string {
	return `cwd=${encodeURIComponent(root)}`;
}

function seed(name: string, content: string): number {
	writeFileSync(join(root, name), content);
	return statSync(join(root, name)).mtimeMs;
}

describe("writeFileContent", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("formats a written typescript file with oxfmt", async () => {
		const mtimeMs = seed("a.ts", "const old = 1;\n");
		const [status, body] = await request(`${cwdParam()}&path=a.ts`, {
			content: "const  x   =1\n",
			mtimeMs,
		});
		expect(status).toBe(200);
		expect(body.content).toBe("const x = 1;\n");
		expect(readFileSync(join(root, "a.ts"), "utf8")).toBe("const x = 1;\n");
	});

	it("returns the modification time the write left behind", async () => {
		const mtimeMs = seed("stamped.ts", "const old = 1;\n");
		const [, body] = await request(`${cwdParam()}&path=stamped.ts`, {
			content: "const x = 1;\n",
			mtimeMs,
		});
		expect(body.mtimeMs).toBe(statSync(join(root, "stamped.ts")).mtimeMs);
	});

	it("writes a file oxfmt does not handle verbatim", async () => {
		const mtimeMs = seed("notes.txt", "old\n");
		const [status, body] = await request(`${cwdParam()}&path=notes.txt`, {
			content: "plain   text\n",
			mtimeMs,
		});
		expect(status).toBe(200);
		expect(body.content).toBe("plain   text\n");
		expect(readFileSync(join(root, "notes.txt"), "utf8")).toBe(
			"plain   text\n",
		);
	});

	it("rejects a write whose file changed on disk, leaving it untouched", async () => {
		const mtimeMs = seed("raced.ts", "const fromAgent = 1;\n");
		const [status, body] = await request(`${cwdParam()}&path=raced.ts`, {
			content: "const fromBrowser = 1;\n",
			mtimeMs: mtimeMs - 1000,
		});
		expect(status).toBe(409);
		expect(body.error).toBe("The file changed on disk since it was opened");
		expect(readFileSync(join(root, "raced.ts"), "utf8")).toBe(
			"const fromAgent = 1;\n",
		);
	});

	it("accepts the write once the buffer is reloaded", async () => {
		const mtimeMs = seed("reloaded.ts", "const fromAgent = 1;\n");
		await request(`${cwdParam()}&path=reloaded.ts`, {
			content: "const fromBrowser = 1;\n",
			mtimeMs: mtimeMs - 1000,
		});
		const [status] = await request(`${cwdParam()}&path=reloaded.ts`, {
			content: "const fromBrowser = 1;\n",
			mtimeMs: statSync(join(root, "reloaded.ts")).mtimeMs,
		});
		expect(status).toBe(200);
		expect(readFileSync(join(root, "reloaded.ts"), "utf8")).toBe(
			"const fromBrowser = 1;\n",
		);
	});

	it("rejects a write to a file that no longer exists", async () => {
		const [status] = await request(`${cwdParam()}&path=deleted.ts`, {
			content: "const x = 1;\n",
			mtimeMs: 1,
		});
		expect(status).toBe(409);
		expect(existsSync(join(root, "deleted.ts"))).toBe(false);
	});

	it("rejects a relative path that escapes the cwd without writing", async () => {
		const [status, body] = await request(`${cwdParam()}&path=../escaped.ts`, {
			content: "const  x   =1\n",
			mtimeMs: 1,
		});
		expect(status).toBe(400);
		expect(body.error).toBe("Path outside cwd");
		expect(existsSync(join(root, "..", "escaped.ts"))).toBe(false);
	});

	it("rejects an absolute path outside the cwd", async () => {
		const outside = join(root, "..", "absolute-escape.ts");
		const [status] = await request(
			`${cwdParam()}&path=${encodeURIComponent(outside)}`,
			{ content: "const x = 1;\n", mtimeMs: 1 },
		);
		expect(status).toBe(400);
		expect(existsSync(outside)).toBe(false);
	});

	it("leaves the file untouched when the body has no content", async () => {
		const mtimeMs = seed("kept.ts", "const kept = 1;\n");
		const [status] = await request(`${cwdParam()}&path=kept.ts`, { mtimeMs });
		expect(status).toBe(400);
		expect(readFileSync(join(root, "kept.ts"), "utf8")).toBe(
			"const kept = 1;\n",
		);
	});

	it("leaves the file untouched when the body has no modification time", async () => {
		seed("unstamped.ts", "const kept = 1;\n");
		const [status] = await request(`${cwdParam()}&path=unstamped.ts`, {
			content: "const changed = 1;\n",
		});
		expect(status).toBe(400);
		expect(readFileSync(join(root, "unstamped.ts"), "utf8")).toBe(
			"const kept = 1;\n",
		);
	});

	it("rejects a request without a path", async () => {
		const [status] = await request(cwdParam(), { content: "x\n", mtimeMs: 1 });
		expect(status).toBe(400);
	});

	it("rejects a missing cwd", async () => {
		const [status] = await request("path=a.ts", { content: "x\n", mtimeMs: 1 });
		expect(status).toBe(400);
	});
});
