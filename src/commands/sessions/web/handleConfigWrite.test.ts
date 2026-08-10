import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRespondJson = vi.fn();

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

vi.mock("../../../lib/detectPlatform", () => ({
	detectPlatform: () => "wsl",
}));

import { handleConfigWrite } from "./handleConfigWrite";

async function post(body: unknown, apply: ReturnType<typeof vi.fn>) {
	const req = Readable.from([
		Buffer.from(JSON.stringify(body)),
	]) as unknown as IncomingMessage;
	await handleConfigWrite(
		req,
		{} as ServerResponse,
		apply as unknown as Parameters<typeof handleConfigWrite>[2],
	);
}

describe("handleConfigWrite", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("translates a Windows-style cwd to the WSL mount before applying", async () => {
		const apply = vi.fn().mockReturnValue({ ok: true, payload: {} });

		await post(
			{
				key: "commit.push",
				value: true,
				cwd: String.raw`C:\git\nextgen`,
				scope: "project",
			},
			apply,
		);

		expect(apply).toHaveBeenCalledWith(
			expect.objectContaining({ cwd: "/mnt/c/git/nextgen" }),
		);
	});

	it("leaves a POSIX cwd untouched", async () => {
		const apply = vi.fn().mockReturnValue({ ok: true, payload: {} });

		await post(
			{
				key: "commit.push",
				value: true,
				cwd: "/home/me/repo",
				scope: "project",
			},
			apply,
		);

		expect(apply).toHaveBeenCalledWith(
			expect.objectContaining({ cwd: "/home/me/repo" }),
		);
	});
});
