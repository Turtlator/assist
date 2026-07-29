import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LineBoundFinding } from "./partitionFindings";

const mockPostAndMaybeSubmit = vi.fn();
const mockChainAfterReview = vi.fn();
const mockSelectPostableFindings = vi.fn();
const mockPromptConfirm = vi.fn();
const mockStillOnReviewedPr = vi.fn();

vi.mock("node:fs", () => ({
	readFileSync: () => "synthesis markdown",
}));

vi.mock("./stillOnReviewedPr", () => ({
	stillOnReviewedPr: (...args: unknown[]) => mockStillOnReviewedPr(...args),
}));

vi.mock("./selectPostableFindings", () => ({
	selectPostableFindings: (...args: unknown[]) =>
		mockSelectPostableFindings(...args),
}));

vi.mock("./postAndMaybeSubmit", () => ({
	postAndMaybeSubmit: (...args: unknown[]) => mockPostAndMaybeSubmit(...args),
}));

vi.mock("./chainAfterReview", () => ({
	chainAfterReview: (...args: unknown[]) => mockChainAfterReview(...args),
}));

vi.mock("../../shared/promptConfirm", () => ({
	promptConfirm: (...args: unknown[]) => mockPromptConfirm(...args),
}));

import { postReviewToPr } from "./postReviewToPr";

const finding = { file: "a.ts", line: 1 } as LineBoundFinding;
const prInfo = { prNumber: 42, baseSha: "base", headSha: "head" };
const options = {
	prompt: false,
	submit: true,
	addressComments: true,
	announce: true,
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	mockSelectPostableFindings.mockReturnValue([finding]);
	mockPostAndMaybeSubmit.mockResolvedValue({ posted: 1, submitted: true });
	mockPromptConfirm.mockResolvedValue(true);
	mockStillOnReviewedPr.mockReturnValue(true);
});

describe("postReviewToPr", () => {
	it("should hand the post outcome to the chain", async () => {
		await postReviewToPr("synthesis.md", prInfo, options);

		expect(mockChainAfterReview).toHaveBeenCalledWith(
			42,
			{ posted: 1, submitted: true },
			options,
		);
	});

	describe("when there are no findings to post", () => {
		it("should still run the chain with nothing posted", async () => {
			mockSelectPostableFindings.mockReturnValue([]);

			await postReviewToPr("synthesis.md", prInfo, options);

			expect(mockPostAndMaybeSubmit).not.toHaveBeenCalled();
			expect(mockChainAfterReview).toHaveBeenCalledWith(
				42,
				{ posted: 0, submitted: false },
				options,
			);
		});
	});

	describe("when the tree moved off the reviewed PR", () => {
		it("should post nothing and chain nothing", async () => {
			mockStillOnReviewedPr.mockReturnValue(false);

			await postReviewToPr("synthesis.md", prInfo, options);

			expect(mockSelectPostableFindings).not.toHaveBeenCalled();
			expect(mockPostAndMaybeSubmit).not.toHaveBeenCalled();
			expect(mockChainAfterReview).not.toHaveBeenCalled();
		});
	});

	describe("when the user declines posting", () => {
		it("should still run the chain with nothing posted", async () => {
			mockPromptConfirm.mockResolvedValue(false);

			await postReviewToPr("synthesis.md", prInfo, {
				...options,
				prompt: true,
			});

			expect(mockPostAndMaybeSubmit).not.toHaveBeenCalled();
			expect(mockChainAfterReview).toHaveBeenCalledWith(
				42,
				{ posted: 0, submitted: false },
				expect.objectContaining({ announce: true }),
			);
		});
	});
});
