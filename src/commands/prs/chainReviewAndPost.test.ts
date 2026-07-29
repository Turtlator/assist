import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequestAssistSession = vi.fn();

vi.mock("../sessions/shared/requestAssistSession", () => ({
	requestAssistSession: (...args: unknown[]) =>
		mockRequestAssistSession(...args),
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

const CHAINED_ARGS = [
	"review",
	"--no-prompt",
	"--submit",
	"42",
	"--address-comments",
];

describe("chainReviewAndPost", () => {
	it("should request a review that posts and then addresses its own comments", async () => {
		await chainReviewAndPost(42, false);

		expect(mockRequestAssistSession).toHaveBeenCalledWith(
			CHAINED_ARGS,
			process.cwd(),
		);
	});

	it("should pass --announce so the tail of the chain announces", async () => {
		await chainReviewAndPost(42, true);

		expect(mockRequestAssistSession).toHaveBeenCalledWith(
			[...CHAINED_ARGS, "--announce"],
			process.cwd(),
		);
	});

	describe("when not running inside an assist session", () => {
		it("should not request a session", async () => {
			delete process.env.ASSIST_SESSION;

			await chainReviewAndPost(42, true);

			expect(mockRequestAssistSession).not.toHaveBeenCalled();
		});
	});

	describe("when the daemon request fails", () => {
		it("should warn instead of throwing", async () => {
			mockRequestAssistSession.mockRejectedValue(new Error("no daemon"));

			await expect(chainReviewAndPost(42, true)).resolves.toBeUndefined();

			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("no daemon"),
			);
		});
	});
});
