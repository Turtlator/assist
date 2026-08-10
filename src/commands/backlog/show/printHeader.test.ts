import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BacklogComment, BacklogItem } from "../types";
import { printHeader } from "./printHeader";

function item(comments?: BacklogComment[]): BacklogItem {
	return {
		id: 1,
		type: "story",
		name: "Item",
		acceptanceCriteria: [],
		status: "in-progress",
		starred: false,
		...(comments ? { comments } : {}),
	};
}

function comment(id: number): BacklogComment {
	return {
		id,
		type: "comment",
		text: `note ${id}`,
		timestamp: "2026-01-01 00:00",
	};
}

describe("printHeader", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
	});

	const output = () =>
		logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");

	it("states the comment count when the item has comments", () => {
		printHeader(item([comment(1), comment(2)]));

		expect(output()).toContain("Comments: 2");
	});

	it("omits the comment count when the item has none", () => {
		printHeader(item());
		printHeader(item([]));

		expect(output()).not.toContain("Comments");
	});
});
