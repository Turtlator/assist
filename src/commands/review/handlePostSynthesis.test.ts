import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPostReviewToPr = vi.fn();
const mockAnnouncePr = vi.fn();
const mockRunRefineSession = vi.fn();
const mockRunApplySession = vi.fn();
const mockRunBacklogSession = vi.fn();

vi.mock("./postReviewToPr", () => ({
	postReviewToPr: (...args: unknown[]) => mockPostReviewToPr(...args),
}));

vi.mock("./announcePr", () => ({
	announcePr: (...args: unknown[]) => mockAnnouncePr(...args),
}));

vi.mock("./runRefineSession", () => ({
	runRefineSession: (...args: unknown[]) => mockRunRefineSession(...args),
}));

vi.mock("./runApplySession", () => ({
	runApplySession: (...args: unknown[]) => mockRunApplySession(...args),
}));

vi.mock("./runBacklogSession", () => ({
	runBacklogSession: (...args: unknown[]) => mockRunBacklogSession(...args),
}));

import { handlePostSynthesis } from "./handlePostSynthesis";

const base = {
	refine: false,
	apply: false,
	backlog: false,
	prompt: false,
	submit: true,
	addressComments: false,
	announce: false,
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("handlePostSynthesis", () => {
	describe("on the posting path", () => {
		it("should leave the chaining to postReviewToPr", async () => {
			await handlePostSynthesis("synthesis.md", 42, {
				...base,
				addressComments: true,
				announce: true,
			});

			expect(mockPostReviewToPr).toHaveBeenCalledWith("synthesis.md", {
				prompt: false,
				submit: true,
				addressComments: true,
				announce: true,
			});
			expect(mockAnnouncePr).not.toHaveBeenCalled();
		});
	});

	describe("on a non-posting mode with --announce", () => {
		it.each([["refine"], ["apply"], ["backlog"]])(
			"should announce after the %s session",
			async (mode) => {
				await handlePostSynthesis("synthesis.md", 42, {
					...base,
					[mode]: true,
					announce: true,
				});

				expect(mockPostReviewToPr).not.toHaveBeenCalled();
				expect(mockAnnouncePr).toHaveBeenCalledWith(42);
			},
		);
	});

	describe("on a non-posting mode without --announce", () => {
		it("should not announce", async () => {
			await handlePostSynthesis("synthesis.md", 42, { ...base, apply: true });

			expect(mockRunApplySession).toHaveBeenCalledWith("synthesis.md");
			expect(mockAnnouncePr).not.toHaveBeenCalled();
		});
	});
});
