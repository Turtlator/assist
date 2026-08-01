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

function renderButton(launchAssist: () => void, launchedFrom?: string) {
	render(
		<SessionLaunchContext.Provider
			value={{
				launchAssist,
				launchAgentInStream: () => {},
				armUpdateReload: () => {},
			}}
		>
			<ReviewButton cwd="/git/repo" pr={pr} launchedFrom={launchedFrom} />
		</SessionLaunchContext.Provider>,
	);
	fireEvent.click(screen.getByRole("button", { name: "Review PR" }));
}

function checkbox(label: string): HTMLInputElement {
	return screen.getByLabelText(label) as HTMLInputElement;
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

	it("defaults both chain toggles off", () => {
		renderButton(vi.fn());

		expect(checkbox("Address comments after").checked).toBe(false);
		expect(checkbox("Announce to Slack after").checked).toBe(false);
	});

	it.each(reviewButtonModes)(
		"appends the enabled chain flags to $label",
		({ label, args }) => {
			const launchAssist = vi.fn();
			renderButton(launchAssist);

			fireEvent.click(checkbox("Address comments after"));
			fireEvent.click(checkbox("Announce to Slack after"));
			fireEvent.click(screen.getByText(label));

			expect(launchAssist).toHaveBeenCalledWith(
				[...args, "42", "--address-comments", "--announce"],
				"/git/repo",
				expect.objectContaining({ inPlace: true }),
			);
		},
	);

	it("resets the chain toggles to off when the menu is reopened", () => {
		const launchAssist = vi.fn();
		renderButton(launchAssist);

		fireEvent.click(checkbox("Announce to Slack after"));
		fireEvent.click(screen.getByText("Review"));
		fireEvent.click(screen.getByRole("button", { name: "Review PR" }));

		expect(checkbox("Announce to Slack after").checked).toBe(false);
	});

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

	it("tags a review with the card it was launched from", () => {
		const launchAssist = vi.fn();
		renderButton(launchAssist, "7");

		fireEvent.click(screen.getByText(reviewButtonModes[0].label));

		expect(launchAssist).toHaveBeenCalledWith(
			expect.anything(),
			"/git/repo",
			expect.objectContaining({ launchedFrom: "7" }),
		);
	});

	it("tags Address Comments with the card it was launched from", () => {
		const launchAssist = vi.fn();
		renderButton(launchAssist, "7");

		fireEvent.click(screen.getByText("Address Comments"));

		expect(launchAssist).toHaveBeenCalledWith(
			["review-pr-comments", "42"],
			"/git/repo",
			expect.objectContaining({ launchedFrom: "7" }),
		);
	});

	it("leaves the launcher unset when the button has no card behind it", () => {
		const launchAssist = vi.fn();
		renderButton(launchAssist);

		fireEvent.click(screen.getByText("Address Comments"));

		expect(launchAssist).toHaveBeenCalledWith(
			["review-pr-comments", "42"],
			"/git/repo",
			expect.objectContaining({ launchedFrom: undefined }),
		);
	});
});
