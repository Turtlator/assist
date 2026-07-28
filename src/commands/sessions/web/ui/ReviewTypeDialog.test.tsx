// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrSummary } from "../prList";
import { reviewButtonModes } from "./reviewButtonModes";
import { ReviewTypeDialog } from "./ReviewTypeDialog";

const pr: PrSummary = {
	number: 42,
	title: "Add a thing",
	author: "someone",
	createdAt: new Date(0).toISOString(),
	url: "https://github.com/org/repo/pull/42",
};

function checkbox(label: string): HTMLInputElement {
	return screen.getByLabelText(label) as HTMLInputElement;
}

afterEach(cleanup);

describe("ReviewTypeDialog", () => {
	it("defaults both chain toggles off", () => {
		render(<ReviewTypeDialog pr={pr} onSelect={vi.fn()} onCancel={vi.fn()} />);

		expect(checkbox("Address comments after").checked).toBe(false);
		expect(checkbox("Announce to Slack after").checked).toBe(false);
	});

	it.each(reviewButtonModes)(
		"selects $label unchanged by default",
		({ label, args }) => {
			const onSelect = vi.fn();
			render(
				<ReviewTypeDialog pr={pr} onSelect={onSelect} onCancel={vi.fn()} />,
			);

			fireEvent.click(screen.getByText(label));

			expect(onSelect).toHaveBeenCalledWith(args);
		},
	);

	it.each(reviewButtonModes)(
		"appends the enabled chain flags to $label",
		({ label, args }) => {
			const onSelect = vi.fn();
			render(
				<ReviewTypeDialog pr={pr} onSelect={onSelect} onCancel={vi.fn()} />,
			);

			fireEvent.click(checkbox("Address comments after"));
			fireEvent.click(checkbox("Announce to Slack after"));
			fireEvent.click(screen.getByText(label));

			expect(onSelect).toHaveBeenCalledWith([
				...args,
				"--address-comments",
				"--announce",
			]);
		},
	);
});
