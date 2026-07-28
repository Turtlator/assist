// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	type SelectionAnchor,
	SelectionCommentPopover,
} from "./SelectionCommentPopover";

afterEach(cleanup);

const anchor: SelectionAnchor = {
	quote: "const a = 1;",
	top: 120,
	left: 40,
};

function noteField(): HTMLTextAreaElement {
	return screen.getByPlaceholderText("Add a note…") as HTMLTextAreaElement;
}

describe("SelectionCommentPopover", () => {
	it("keeps the typed note when the refreshed selection re-anchors", () => {
		const { rerender } = render(
			<SelectionCommentPopover
				pending={anchor}
				onAdd={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		fireEvent.change(noteField(), { target: { value: "needs a guard" } });

		rerender(
			<SelectionCommentPopover
				pending={{ ...anchor, top: 260 }}
				moved={false}
				onAdd={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(noteField().value).toBe("needs a guard");
		expect(screen.getByText(anchor.quote)).toBeTruthy();
	});

	it("submits the typed note after a re-anchor", () => {
		const onAdd = vi.fn();
		const { rerender } = render(
			<SelectionCommentPopover
				pending={anchor}
				onAdd={onAdd}
				onCancel={vi.fn()}
			/>,
		);
		fireEvent.change(noteField(), { target: { value: "needs a guard" } });

		rerender(
			<SelectionCommentPopover
				pending={{ ...anchor, top: 260 }}
				moved
				onAdd={onAdd}
				onCancel={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText("Add comment"));

		expect(onAdd).toHaveBeenCalledWith("needs a guard");
	});

	it("warns that the lines changed while keeping the original quote", () => {
		render(
			<SelectionCommentPopover
				pending={anchor}
				moved
				onAdd={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(
			screen.getByText(/lines changed since you selected them/),
		).toBeTruthy();
		expect(screen.getByText(anchor.quote)).toBeTruthy();
	});

	it("drops the draft once the popover has closed", () => {
		const { rerender } = render(
			<SelectionCommentPopover
				pending={anchor}
				onAdd={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		fireEvent.change(noteField(), { target: { value: "needs a guard" } });

		rerender(
			<SelectionCommentPopover
				pending={null}
				onAdd={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		rerender(
			<SelectionCommentPopover
				pending={anchor}
				onAdd={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(noteField().value).toBe("");
	});
});
