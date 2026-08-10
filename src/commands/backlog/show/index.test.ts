import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "../../../shared/db/Db";
import type { BacklogItem } from "../types";
import { show } from "./index";

const findOneItem = vi.hoisted(() => vi.fn());

vi.mock("../shared", () => ({ findOneItem }));

const item: BacklogItem = {
	id: 1,
	type: "story",
	name: "Item",
	acceptanceCriteria: ["does the thing"],
	status: "in-progress",
	starred: false,
	comments: [
		{
			id: 1,
			type: "comment",
			text: "a finding",
			timestamp: "2026-01-01 00:00",
		},
	],
	plan: [{ name: "Fix", tasks: [{ task: "do it" }] }],
	gitRefs: [{ kind: "branch", ref: "feature" }],
};

describe("show", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		findOneItem.mockResolvedValue({ orm: {} as Db, item });
	});

	afterEach(() => {
		logSpy.mockRestore();
		vi.clearAllMocks();
	});

	const lines = () => logSpy.mock.calls.map((c: unknown[]) => String(c[0]));

	it("prints comments ahead of the plan and activity sections", async () => {
		await show("a1");

		const out = lines();
		const commentsIdx = out.findIndex((l: string) => l.includes("a finding"));
		const planIdx = out.findIndex((l: string) => l.includes("Phase 1: Fix"));
		const activityIdx = out.findIndex((l: string) => l.includes("feature"));

		expect(commentsIdx).toBeGreaterThan(-1);
		expect(commentsIdx).toBeLessThan(planIdx);
		expect(commentsIdx).toBeLessThan(activityIdx);
	});

	it("advertises the comment count in the header", async () => {
		await show("a1");

		expect(lines()[1]).toContain("Comments: 1");
	});
});
