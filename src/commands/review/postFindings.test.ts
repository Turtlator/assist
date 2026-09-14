import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LineBoundFinding } from "./partitionFindings";

const mockComment = vi.fn();

vi.mock("../prs/comment", () => ({
	comment: (...args: unknown[]) => mockComment(...args),
}));

import { buildCommentBody, postFindings } from "./postFindings";

const FINDING: LineBoundFinding = {
	title: "Null pointer dereference",
	severity: "blocker",
	source: "confirmed",
	location: "src/foo.ts:42",
	impact: "Crash on null input.",
	recommendation: "Add a null guard before dereferencing.",
	file: "src/foo.ts",
	line: 42,
};

describe("buildCommentBody", () => {
	it("includes severity, title, impact and recommendation", () => {
		const body = buildCommentBody(FINDING);
		expect(body).toContain("blocker");
		expect(body).toContain("Null pointer dereference");
		expect(body).toContain("Crash on null input.");
		expect(body).toContain("Add a null guard before dereferencing.");
	});

	it("sanitises reviewer names that would be rejected by prs comment", () => {
		const body = buildCommentBody({
			...FINDING,
			impact: "Claude flagged this and Opus also raised it.",
		});
		expect(body.toLowerCase()).not.toContain("claude");
		expect(body.toLowerCase()).not.toContain("opus");
		expect(body).toContain("the reviewer");
	});

	it("omits optional sections when blank", () => {
		const body = buildCommentBody({
			...FINDING,
			impact: "",
			recommendation: "",
		});
		expect(body).toContain("blocker");
		expect(body).not.toContain("Impact:");
		expect(body).not.toContain("Recommendation:");
	});
});

const SECOND_FINDING: LineBoundFinding = {
	...FINDING,
	title: "Missing env lock",
	location: "src/bar.ts:10",
	file: "src/bar.ts",
	line: 10,
	startLine: 8,
};

describe("postFindings", () => {
	beforeEach(() => {
		mockComment.mockReset();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("posts every finding without the preview pane", async () => {
		mockComment.mockResolvedValue(undefined);

		const result = await postFindings([FINDING, SECOND_FINDING]);

		expect(result).toEqual({ posted: 2, failed: 0 });
		expect(mockComment).toHaveBeenNthCalledWith(
			1,
			"src/foo.ts",
			42,
			expect.any(String),
			{ startLine: undefined, skipPreview: true },
		);
		expect(mockComment).toHaveBeenNthCalledWith(
			2,
			"src/bar.ts",
			10,
			expect.any(String),
			{ startLine: 8, skipPreview: true },
		);
	});

	it("posts one finding at a time", async () => {
		let inFlight = 0;
		let overlapped = false;
		mockComment.mockImplementation(async () => {
			inFlight++;
			overlapped ||= inFlight > 1;
			await Promise.resolve();
			inFlight--;
		});

		await postFindings([FINDING, SECOND_FINDING]);

		expect(overlapped).toBe(false);
	});

	it("counts a rejected post as failed", async () => {
		mockComment
			.mockRejectedValueOnce(new Error("outside the diff"))
			.mockResolvedValueOnce(undefined);

		const result = await postFindings([FINDING, SECOND_FINDING]);

		expect(result).toEqual({ posted: 1, failed: 1 });
	});
});
