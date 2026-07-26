import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { diffScopes } from "./diffScopes";
import { itemScopeCommits } from "./itemScopeCommits";

vi.mock("./itemScopeCommits", () => ({ itemScopeCommits: vi.fn() }));

const itemScopeCommitsMock = vi.mocked(itemScopeCommits);

async function request(
	url = "/api/diff-scopes?cwd=%2Frepo&session=sess-1",
): Promise<{ status: number; body: unknown }> {
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
	await diffScopes({ url } as IncomingMessage, res);
	return { status, body: body ? JSON.parse(body) : undefined };
}

describe("diffScopes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		itemScopeCommitsMock.mockResolvedValue([]);
	});

	it("rejects a request without a cwd", async () => {
		const { status } = await request("/api/diff-scopes");

		expect(status).toBe(400);
		expect(itemScopeCommitsMock).not.toHaveBeenCalled();
	});

	it("returns the item's commits with their subject and url", async () => {
		itemScopeCommitsMock.mockResolvedValue([
			{ sha: "one", title: "feat: one", url: "https://host/one" },
			{ sha: "two", title: "fix: two" },
		]);

		const { status, body } = await request();

		expect(status).toBe(200);
		expect(body).toEqual({
			commits: [
				{ sha: "one", title: "feat: one", url: "https://host/one" },
				{ sha: "two", title: "fix: two" },
			],
		});
		expect(itemScopeCommitsMock).toHaveBeenCalledWith("/repo", "sess-1");
	});

	it("returns no commits when the request carries no session", async () => {
		await request("/api/diff-scopes?cwd=%2Frepo");

		expect(itemScopeCommitsMock).toHaveBeenCalledWith("/repo", undefined);
	});

	it("returns no commits when the lookup fails", async () => {
		itemScopeCommitsMock.mockRejectedValue(new Error("database unreachable"));

		const { status, body } = await request();

		expect(status).toBe(200);
		expect(body).toEqual({ commits: [] });
	});
});
