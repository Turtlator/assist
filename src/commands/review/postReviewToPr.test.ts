import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LineBoundFinding } from "./partitionFindings";

const mockPostAndMaybeSubmit = vi.fn();
const mockChainAddressComments = vi.fn();
const mockSelectPostableFindings = vi.fn();

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

vi.mock("./chainAddressComments", () => ({
	chainAddressComments: (...args: unknown[]) =>
		mockChainAddressComments(...args),
}));

vi.mock("../../shared/promptConfirm", () => ({
	promptConfirm: () => Promise.resolve(true),
}));

import { postReviewToPr } from "./postReviewToPr";

const finding = { file: "a.ts", line: 1 } as LineBoundFinding;

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	mockSelectPostableFindings.mockReturnValue([finding]);
	mockPostAndMaybeSubmit.mockResolvedValue({ posted: 1, submitted: true });
});

const options = { prompt: false, submit: true, addressComments: true };

describe("postReviewToPr", () => {
	describe("with --address-comments", () => {
		it("should chain an Address Comments session once posted and submitted", async () => {
			await postReviewToPr("synthesis.md", options);

			expect(mockChainAddressComments).toHaveBeenCalledWith(42);
		});

		it("should not chain when nothing was posted", async () => {
			mockPostAndMaybeSubmit.mockResolvedValue({
				posted: 0,
				submitted: false,
			});

			await postReviewToPr("synthesis.md", options);

			expect(mockChainAddressComments).not.toHaveBeenCalled();
		});

		it("should not chain when the review was left unsubmitted", async () => {
			mockPostAndMaybeSubmit.mockResolvedValue({
				posted: 2,
				submitted: false,
			});

			await postReviewToPr("synthesis.md", options);

			expect(mockChainAddressComments).not.toHaveBeenCalled();
		});

		it("should not chain when there are no findings to post", async () => {
			mockSelectPostableFindings.mockReturnValue([]);

			await postReviewToPr("synthesis.md", options);

			expect(mockPostAndMaybeSubmit).not.toHaveBeenCalled();
			expect(mockChainAddressComments).not.toHaveBeenCalled();
		});
	});

	describe("without --address-comments", () => {
		it("should not chain even when posted and submitted", async () => {
			await postReviewToPr("synthesis.md", {
				...options,
				addressComments: false,
			});

			expect(mockChainAddressComments).not.toHaveBeenCalled();
		});
	});
});
