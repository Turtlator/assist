import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { readRequestBuffer } from "./readRequestBuffer";

const LIMIT = 64 * 1024;

let close: (() => void) | undefined;

afterEach(() => {
	close?.();
	close = undefined;
});

async function post(bytes: number): Promise<{
	status: number;
	body: { error?: string; bytes?: number };
}> {
	const server = createServer(async (req, res) => {
		const received = await readRequestBuffer(req, LIMIT);
		res.writeHead(received ? 200 : 413, {
			"Content-Type": "application/json",
		});
		res.end(
			JSON.stringify(
				received ? { bytes: received.length } : { error: "Too large." },
			),
		);
	});
	await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
	close = () => server.close();

	const { port } = server.address() as AddressInfo;
	const res = await fetch(`http://127.0.0.1:${port}/`, {
		method: "POST",
		body: new Blob([new Uint8Array(bytes)]),
	});
	return { status: res.status, body: await res.json() };
}

describe("readRequestBuffer", () => {
	it("returns the body when it is within the limit", async () => {
		const res = await post(1024);
		expect(res).toEqual({ status: 200, body: { bytes: 1024 } });
	});

	it("delivers the rejection to the client when the body exceeds the limit", async () => {
		const res = await post(LIMIT * 4);
		expect(res).toEqual({ status: 413, body: { error: "Too large." } });
	});
});
