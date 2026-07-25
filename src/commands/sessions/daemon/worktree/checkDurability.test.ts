import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { gitResult } from "./git";
import { checkDurability } from "./treeDurability";

vi.mock("node:fs", () => ({ existsSync: vi.fn(() => true) }));
vi.mock("./git", () => ({ gitResult: vi.fn() }));
vi.mock("../../../../shared/loadConfigFrom", () => ({
	loadConfigFrom: vi.fn(() => ({ commit: { push: false } })),
}));

const existsMock = existsSync as unknown as ReturnType<typeof vi.fn>;
const gitMock = gitResult as unknown as ReturnType<typeof vi.fn>;

function gitReplies(replies: Record<string, { ok: boolean; out?: string }>) {
	gitMock.mockImplementation((_cwd: string, args: string[]) => {
		const reply = replies[args[0] as string] ?? { ok: false };
		return Promise.resolve(
			reply.ok
				? { ok: true, out: reply.out ?? "" }
				: { ok: false, error: "fatal: not a git repository" },
		);
	});
}

describe("checkDurability", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsMock.mockReturnValue(true);
	});

	it("treats a tree that no longer exists as durable, holding nothing on a phantom", async () => {
		existsMock.mockReturnValue(false);

		expect(await checkDurability("/git/repo-3")).toEqual({ durable: true });
		expect(gitMock).not.toHaveBeenCalled();
	});

	it("never reports unpushed commits when the tree state cannot be read", async () => {
		gitReplies({});

		const durability = await checkDurability("/git/broken");

		expect(durability.durable).toBe(false);
		expect(durability.durable === false ? durability.reason : "").not.toContain(
			"unpushed commits",
		);
	});

	it("holds a dirty tree", async () => {
		gitReplies({ status: { ok: true, out: " M src/a.ts" } });

		expect(await checkDurability("/git/repo-2")).toEqual({
			durable: false,
			reason: "uncommitted changes",
		});
	});

	it("is durable once the branch is clean and its upstream has the commits", async () => {
		gitReplies({
			status: { ok: true, out: "" },
			"rev-parse": { ok: true, out: "origin/main" },
			"rev-list": { ok: true, out: "0" },
		});

		expect(await checkDurability("/git/repo-2")).toEqual({ durable: true });
	});

	it("holds a clean tree whose commits are ahead of its upstream", async () => {
		gitReplies({
			status: { ok: true, out: "" },
			"rev-parse": { ok: true, out: "origin/main" },
			"rev-list": { ok: true, out: "2" },
		});

		expect(await checkDurability("/git/repo-2")).toEqual({
			durable: false,
			reason: "unpushed commits",
		});
	});
});
