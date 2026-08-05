import { beforeEach, describe, expect, it, vi } from "vitest";

const placePrMock = vi.fn();
const requestPrDecisionMock = vi.fn();
const chainAfterRaiseMock = vi.fn();
vi.mock("./placePr", () => ({
	placePr: (...args: unknown[]) => placePrMock(...args),
}));
vi.mock("./chainAfterRaise", () => ({
	chainAfterRaise: (...args: unknown[]) => chainAfterRaiseMock(...args),
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

	it("sends the resolved draft state to the preview pane", async () => {
		requestPrDecisionMock.mockResolvedValue({ decision: "approve" });

		await previewAndPlace({ ...args, options: { draft: true } });

		expect(requestPrDecisionMock).toHaveBeenCalledWith(
			expect.objectContaining({ draft: true }),
		);
	});

	it("sends a false draft state when the PR will be raised ready", async () => {
		requestPrDecisionMock.mockResolvedValue({ decision: "approve" });

		await previewAndPlace(args);

		expect(requestPrDecisionMock).toHaveBeenCalledWith(
			expect.objectContaining({ draft: false }),
		);
	});

	describe("chaining after the PR is placed", () => {
		it("hands the reviewer's toggles to the chain once the PR exists", async () => {
			requestPrDecisionMock.mockResolvedValue({
				decision: "approve",
				reviewAfter: true,
				announceAfter: false,
			});
			const placedFirst: string[] = [];
			placePrMock.mockImplementationOnce(() => placedFirst.push("place"));
			chainAfterRaiseMock.mockImplementationOnce(() =>
				placedFirst.push("chain"),
			);

			await previewAndPlace({ ...args, prNumber: 42 });

			expect(chainAfterRaiseMock).toHaveBeenCalledWith(
				42,
				expect.objectContaining({ reviewAfter: true, announceAfter: false }),
			);
			expect(placedFirst).toEqual(["place", "chain"]);
		});

		it("passes a null PR number through for a newly created PR", async () => {
			requestPrDecisionMock.mockResolvedValue({
				decision: "approve",
				reviewAfter: true,
				announceAfter: true,
			});

			await previewAndPlace(args);

			expect(chainAfterRaiseMock).toHaveBeenCalledWith(
				null,
				expect.objectContaining({ reviewAfter: true, announceAfter: true }),
			);
		});
	});
});
