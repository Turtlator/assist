import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCheckoutPr = vi.fn();
const mockSpawnClaude = vi.fn(() => ({ done: Promise.resolve(0) }));
const calls: string[] = [];

vi.mock("./review/checkoutPr", () => ({
	checkoutPr: (number: string) => {
		calls.push("checkout");
		return mockCheckoutPr(number);
	},
}));

vi.mock("../shared/spawnClaude", () => ({
	spawnClaude: (...args: unknown[]) => {
		calls.push("claude");
		return mockSpawnClaude(...(args as []));
	},
}));

vi.mock("../shared/emitActivity", () => ({ emitActivity: vi.fn() }));

import { reviewPrComments } from "./reviewPrComments";

beforeEach(() => {
	vi.clearAllMocks();
	calls.length = 0;
});

describe("reviewPrComments", () => {
	describe("when a PR number is given", () => {
		it("should check the PR out through the allocator before starting the pass", async () => {
			await reviewPrComments("123");

			expect(mockCheckoutPr).toHaveBeenCalledWith("123");
			expect(calls).toEqual(["checkout", "claude"]);
		});
	});

	describe("when no PR number is given", () => {
		it("should run the pass in the tree it was invoked in", async () => {
			await reviewPrComments();

			expect(mockCheckoutPr).not.toHaveBeenCalled();
			expect(mockSpawnClaude).toHaveBeenCalled();
		});
	});

	describe("with --announce", () => {
		it("should ask the pass to announce the PR when it finishes", async () => {
			await reviewPrComments("123", { announce: true });

			expect(mockSpawnClaude).toHaveBeenCalledWith(
				"/review-pr-comments --announce 123",
				expect.anything(),
			);
		});

		it("should exit when no PR number is given", async () => {
			const exit = vi.spyOn(process, "exit").mockImplementation(() => {
				throw new Error("process.exit");
			});
			vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(
				reviewPrComments(undefined, { announce: true }),
			).rejects.toThrow("process.exit");

			exit.mockRestore();
		});
	});

	describe("without --announce", () => {
		it("should run the plain pass", async () => {
			await reviewPrComments("123");

			expect(mockSpawnClaude).toHaveBeenCalledWith(
				"/review-pr-comments",
				expect.anything(),
			);
		});
	});
});
