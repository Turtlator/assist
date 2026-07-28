import { beforeEach, describe, expect, it, vi } from "vitest";

const placePrMock = vi.fn();
const requestPrDecisionMock = vi.fn();
const chainReviewAndPostMock = vi.fn();
vi.mock("./placePr", () => ({
	placePr: (...args: unknown[]) => placePrMock(...args),
}));
vi.mock("./chainReviewAndPost", () => ({
	chainReviewAndPost: (...args: unknown[]) => chainReviewAndPostMock(...args),
}));
vi.mock("../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		requestPrDecisionMock(...args),
}));

import { previewAndPlace } from "./previewAndPlace";

const args = {
	sessionId: "s",
	title: "t",
	body: "## What\n\nx",
	prNumber: null,
	options: {},
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("previewAndPlace", () => {
	it("appends approved screenshots under a ## Screenshots section", async () => {
		requestPrDecisionMock.mockResolvedValue({
			decision: "approve",
			screenshots: ["![a](u1)", "![b](u2)"],
		});

		await previewAndPlace(args);

		expect(placePrMock).toHaveBeenCalledWith(
			null,
			"t",
			"## What\n\nx\n\n## Screenshots\n\n![a](u1)\n\n![b](u2)",
			{},
		);
	});

	it("leaves the body untouched when there are no screenshots", async () => {
		requestPrDecisionMock.mockResolvedValue({ decision: "approve" });

		await previewAndPlace(args);

		expect(placePrMock).toHaveBeenCalledWith(null, "t", "## What\n\nx", {});
	});

	describe("chaining a Review + Post session", () => {
		it("chains after the PR is placed when the reviewer asked for it", async () => {
			requestPrDecisionMock.mockResolvedValue({
				decision: "approve",
				reviewAfter: true,
			});

			await previewAndPlace({ ...args, prNumber: 42 });

			expect(placePrMock).toHaveBeenCalled();
			expect(chainReviewAndPostMock).toHaveBeenCalledWith(42);
		});

		it("passes a null PR number through for a newly created PR", async () => {
			requestPrDecisionMock.mockResolvedValue({
				decision: "approve",
				reviewAfter: true,
			});

			await previewAndPlace(args);

			expect(chainReviewAndPostMock).toHaveBeenCalledWith(null);
		});

		it("chains nothing when the reviewer turned it off", async () => {
			requestPrDecisionMock.mockResolvedValue({
				decision: "approve",
				reviewAfter: false,
			});

			await previewAndPlace(args);

			expect(placePrMock).toHaveBeenCalled();
			expect(chainReviewAndPostMock).not.toHaveBeenCalled();
		});

		it("chains nothing when the decision carries no choice", async () => {
			requestPrDecisionMock.mockResolvedValue({ decision: "approve" });

			await previewAndPlace(args);

			expect(chainReviewAndPostMock).not.toHaveBeenCalled();
		});
	});
});
