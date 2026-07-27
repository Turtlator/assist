// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrSummary } from "../prList";
import { ReviewButton } from "./ReviewButton";
import { reviewButtonModes } from "./reviewButtonModes";
import { SessionLaunchContext } from "./useSessionLaunchContext";

const pr: PrSummary = {
	number: 42,
	title: "Add a thing",
	author: "someone",
	createdAt: new Date(0).toISOString(),
	url: "https://github.com/org/repo/pull/42",
};

function renderButton(launchAssist: () => void) {
	render(
		<SessionLaunchContext.Provider
			value={{
				launchAssist,
				launchAgentInStream: () => {},
				armUpdateReload: () => {},
			}}
		>
			<ReviewButton cwd="/git/repo" pr={pr} />
		</SessionLaunchContext.Provider>,
	);
	fireEvent.click(screen.getByRole("button", { name: "Review PR" }));
}

afterEach(cleanup);

describe("ReviewButton", () => {
	it.each(reviewButtonModes)(
		"launches $label against the PR shown on the card, in that card's tree",
		({ label, args }) => {
			const launchAssist = vi.fn();
			renderButton(launchAssist);

			fireEvent.click(screen.getByText(label));

			expect(launchAssist).toHaveBeenCalledWith(
				[...args, "42"],
				"/git/repo",
				expect.objectContaining({ inPlace: true }),
			);
		},
	);

	it("launches Address Comments against the PR shown on the card", () => {
		const launchAssist = vi.fn();
		renderButton(launchAssist);

		fireEvent.click(screen.getByText("Address Comments"));

		expect(launchAssist).toHaveBeenCalledWith(
			["review-pr-comments", "42"],
			"/git/repo",
			expect.objectContaining({ inPlace: true }),
		);
	});
});
