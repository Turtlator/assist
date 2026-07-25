import { beforeEach, describe, expect, it, vi } from "vitest";
import { describeHeldWork } from "./describeHeldWork";
import { gitResult } from "./git";

vi.mock("./git", () => ({ gitResult: vi.fn() }));

const gitMock = gitResult as unknown as ReturnType<typeof vi.fn>;

function replies(out: string, ok = true) {
	gitMock.mockResolvedValue(
		ok ? { ok: true, out } : { ok: false, error: "fatal: no upstream" },
	);
}

describe("describeHeldWork", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("names the files a dirty workspace is holding", async () => {
		replies(" M src/a.ts\n M src/b.ts\n?? notes.md");

		expect(
			await describeHeldWork("/git/repo-2", "uncommitted changes"),
		).toEqual({
			summary: "3 uncommitted files",
			items: ["M src/a.ts", "M src/b.ts", "?? notes.md"],
		});
	});

	it("counts a single file in the singular", async () => {
		replies(" M src/a.ts");

		const held = await describeHeldWork("/git/repo-2", "uncommitted changes");

		expect(held.summary).toBe("1 uncommitted file");
	});

	it("names the commits an unpushed workspace is holding", async () => {
		replies("abc1234 feat: one\ndef5678 fix: two");

		expect(await describeHeldWork("/git/repo-2", "unpushed commits")).toEqual({
			summary: "2 unpushed commits",
			items: ["abc1234 feat: one", "def5678 fix: two"],
		});
	});

	it("caps a long list rather than flooding the card", async () => {
		replies(
			Array.from({ length: 25 }, (_, n) => ` M src/file${n}.ts`).join("\n"),
		);

		const held = await describeHeldWork("/git/repo-2", "uncommitted changes");

		expect(held.summary).toBe("25 uncommitted files");
		expect(held.items).toHaveLength(21);
		expect(held.items[20]).toBe("… and 5 more");
	});

	it("falls back to the held reason when git cannot be read", async () => {
		replies("", false);

		expect(await describeHeldWork("/git/repo-2", "unpushed commits")).toEqual({
			summary: "unpushed commits",
			items: [],
		});
	});

	it("says nothing extra about a state it could not determine", async () => {
		const held = await describeHeldWork(
			"/git/repo-2",
			"tree state unreadable: fatal",
		);

		expect(held).toEqual({
			summary: "tree state unreadable: fatal",
			items: [],
		});
		expect(gitMock).not.toHaveBeenCalled();
	});
});
