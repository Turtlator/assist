import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LineBoundFinding } from "./partitionFindings";

const mockPostAndMaybeSubmit = vi.fn();
const mockChainAfterReview = vi.fn();
const mockSelectPostableFindings = vi.fn();
const mockPromptConfirm = vi.fn();

vi.mock("node:fs", () => ({
	readFileSync: () => "synthesis markdown",
}));

vi.mock("./fetchPrDiffInfo", () => ({
	fetchPrDiffInfo: () => ({ prNumber: 42 }),
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
});

describe("postReviewToPr", () => {
	it("should hand the post outcome to the chain", async () => {
		await postReviewToPr("synthesis.md", options);

		expect(mockChainAfterReview).toHaveBeenCalledWith(
			42,
			{ posted: 1, submitted: true },
			options,
		);
	});

	describe("when there are no findings to post", () => {
		it("should still run the chain with nothing posted", async () => {
			mockSelectPostableFindings.mockReturnValue([]);

			await postReviewToPr("synthesis.md", options);

			expect(mockPostAndMaybeSubmit).not.toHaveBeenCalled();
			expect(mockChainAfterReview).toHaveBeenCalledWith(
				42,
				{ posted: 0, submitted: false },
				options,
			);
		});
	});

	describe("when the user declines posting", () => {
		it("should still run the chain with nothing posted", async () => {
			mockPromptConfirm.mockResolvedValue(false);

			await postReviewToPr("synthesis.md", { ...options, prompt: true });

			expect(mockPostAndMaybeSubmit).not.toHaveBeenCalled();
			expect(mockChainAfterReview).toHaveBeenCalledWith(
				42,
				{ posted: 0, submitted: false },
				expect.objectContaining({ announce: true }),
			);
		});
	});
});
