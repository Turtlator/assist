import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindCurrentPrNumber = vi.fn();

vi.mock("../prs/shared", () => ({
	findCurrentPrNumber: () => mockFindCurrentPrNumber(),
}));

import { stillOnReviewedPr } from "./stillOnReviewedPr";

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("stillOnReviewedPr", () => {
	it("should hold when the tree is still on the reviewed PR", () => {
		mockFindCurrentPrNumber.mockReturnValue(42);

		expect(stillOnReviewedPr(42)).toBe(true);
		expect(console.error).not.toHaveBeenCalled();
	});

	describe("when another session moved the tree to a different PR", () => {
		it("should refuse and name both PRs", () => {
			mockFindCurrentPrNumber.mockReturnValue(179);

			expect(stillOnReviewedPr(181)).toBe(false);
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("PR #179"),
			);
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("PR #181"),
			);
		});
	});

	describe("when the branch has no open PR", () => {
		it("should refuse", () => {
			mockFindCurrentPrNumber.mockReturnValue(null);

			expect(stillOnReviewedPr(181)).toBe(false);
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("no open PR"),
			);
		});
	});

	describe("when the lookup fails", () => {
		it("should refuse rather than risk the wrong PR", () => {
			mockFindCurrentPrNumber.mockImplementation(() => {
				throw new Error("gh exploded");
			});

			expect(stillOnReviewedPr(181)).toBe(false);
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("gh exploded"),
			);
		});
	});
});
