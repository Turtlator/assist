import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockChainReviewAndPost = vi.fn();
const mockAnnouncePr = vi.fn();
const mockFindCurrentPrNumber = vi.fn();

vi.mock("./chainReviewAndPost", () => ({
	chainReviewAndPost: (...args: unknown[]) => mockChainReviewAndPost(...args),
}));

vi.mock("../review/announcePr", () => ({
	announcePr: (...args: unknown[]) => mockAnnouncePr(...args),
}));

vi.mock("./shared", () => ({
	findCurrentPrNumber: () => mockFindCurrentPrNumber(),
}));

import { chainAfterRaise } from "./chainAfterRaise";

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "error").mockImplementation(() => {});
	process.env.ASSIST_SESSION = "1";
});

afterEach(() => {
	delete process.env.ASSIST_SESSION;
});

describe("chainAfterRaise", () => {
	describe("with both toggles on", () => {
		it("should chain a review that carries the announce at its tail", async () => {
			await chainAfterRaise(42, { reviewAfter: true, announceAfter: true });

			expect(mockChainReviewAndPost).toHaveBeenCalledWith(42, true);
			expect(mockAnnouncePr).not.toHaveBeenCalled();
		});
	});

	describe("with only the review toggle on", () => {
		it("should chain a review without an announce", async () => {
			await chainAfterRaise(42, { reviewAfter: true, announceAfter: false });

			expect(mockChainReviewAndPost).toHaveBeenCalledWith(42, false);
			expect(mockAnnouncePr).not.toHaveBeenCalled();
		});
	});

	describe("with only the post toggle on", () => {
		it("should announce the PR directly", async () => {
			await chainAfterRaise(42, { reviewAfter: false, announceAfter: true });

			expect(mockAnnouncePr).toHaveBeenCalledWith(42);
			expect(mockChainReviewAndPost).not.toHaveBeenCalled();
		});
	});

	describe("with both toggles off", () => {
		it("should chain nothing and not look up the PR", async () => {
			await chainAfterRaise(null, { reviewAfter: false, announceAfter: false });

			expect(mockChainReviewAndPost).not.toHaveBeenCalled();
			expect(mockAnnouncePr).not.toHaveBeenCalled();
			expect(mockFindCurrentPrNumber).not.toHaveBeenCalled();
		});
	});

	describe("for a newly created PR", () => {
		it("should resolve the number from the branch", async () => {
			mockFindCurrentPrNumber.mockReturnValue(7);

			await chainAfterRaise(null, { reviewAfter: true, announceAfter: true });

			expect(mockChainReviewAndPost).toHaveBeenCalledWith(7, true);
		});

		it("should warn instead of chaining when the branch has no PR", async () => {
			mockFindCurrentPrNumber.mockReturnValue(null);

			await chainAfterRaise(null, { reviewAfter: true, announceAfter: true });

			expect(mockChainReviewAndPost).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("no pull request found"),
			);
		});

		it("should warn instead of throwing when the lookup fails", async () => {
			mockFindCurrentPrNumber.mockImplementation(() => {
				throw new Error("gh exploded");
			});

			await expect(
				chainAfterRaise(null, { reviewAfter: true, announceAfter: true }),
			).resolves.toBeUndefined();

			expect(mockChainReviewAndPost).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("gh exploded"),
			);
		});
	});

	describe("when not running inside an assist session", () => {
		it("should chain nothing", async () => {
			delete process.env.ASSIST_SESSION;

			await chainAfterRaise(42, { reviewAfter: true, announceAfter: true });

			expect(mockChainReviewAndPost).not.toHaveBeenCalled();
			expect(mockAnnouncePr).not.toHaveBeenCalled();
		});
	});
});
