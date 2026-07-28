import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequestAssistSession = vi.fn();
const mockFindCurrentPrNumber = vi.fn();

vi.mock("../sessions/shared/requestAssistSession", () => ({
	requestAssistSession: (...args: unknown[]) =>
		mockRequestAssistSession(...args),
}));

vi.mock("./shared", () => ({
	findCurrentPrNumber: () => mockFindCurrentPrNumber(),
}));

import { chainReviewAndPost } from "./chainReviewAndPost";

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(console, "error").mockImplementation(() => {});
	mockRequestAssistSession.mockResolvedValue("session-1");
	process.env.ASSIST_SESSION = "1";
});

afterEach(() => {
	delete process.env.ASSIST_SESSION;
});

const chainedArgs = (n: string) => [
	"review",
	"--no-prompt",
	"--submit",
	n,
	"--address-comments",
	"--announce",
];

describe("chainReviewAndPost", () => {
	it("should request a Review + Post session that chains the rest of the tail", async () => {
		await chainReviewAndPost(42);

		expect(mockRequestAssistSession).toHaveBeenCalledWith(
			chainedArgs("42"),
			process.cwd(),
		);
		expect(mockFindCurrentPrNumber).not.toHaveBeenCalled();
	});

	it("should resolve the number of a newly created PR from the branch", async () => {
		mockFindCurrentPrNumber.mockReturnValue(7);

		await chainReviewAndPost(null);

		expect(mockRequestAssistSession).toHaveBeenCalledWith(
			chainedArgs("7"),
			process.cwd(),
		);
	});

	describe("when the branch has no PR", () => {
		it("should warn instead of requesting a session", async () => {
			mockFindCurrentPrNumber.mockReturnValue(null);

			await expect(chainReviewAndPost(null)).resolves.toBeUndefined();

			expect(mockRequestAssistSession).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("no pull request found"),
			);
		});
	});

	describe("when not running inside an assist session", () => {
		it("should not request a session", async () => {
			delete process.env.ASSIST_SESSION;

			await chainReviewAndPost(42);

			expect(mockRequestAssistSession).not.toHaveBeenCalled();
		});
	});

	describe("when the daemon request fails", () => {
		it("should warn instead of throwing", async () => {
			mockRequestAssistSession.mockRejectedValue(new Error("no daemon"));

			await expect(chainReviewAndPost(42)).resolves.toBeUndefined();

			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("no daemon"),
			);
		});
	});
});
