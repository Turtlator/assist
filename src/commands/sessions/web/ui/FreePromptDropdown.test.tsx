// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FreePromptDropdown } from "./FreePromptDropdown";

afterEach(cleanup);

function openDropdown(onSubmit: (prompt: string) => void, allowEmpty = true) {
	render(
		<FreePromptDropdown
			disabled={false}
			onSubmit={onSubmit}
			allowEmpty={allowEmpty}
		/>,
	);
	fireEvent.click(screen.getByRole("button", { name: "prompt" }));
	return screen.getByRole("textbox");
}

describe("FreePromptDropdown", () => {
	it("submits an empty prompt on Enter when empty is allowed", () => {
		const onSubmit = vi.fn();
		const input = openDropdown(onSubmit);

		fireEvent.keyDown(input, { key: "Enter" });

		expect(onSubmit).toHaveBeenCalledWith("");
	});

	it("submits the typed prompt on Enter", () => {
		const onSubmit = vi.fn();
		const input = openDropdown(onSubmit);

		fireEvent.change(input, { target: { value: "ship it" } });
		fireEvent.keyDown(input, { key: "Enter" });

		expect(onSubmit).toHaveBeenCalledWith("ship it");
		expect(screen.queryByRole("textbox")).not.toBeTruthy();
	});

	it("does not submit on Shift+Enter", () => {
		const onSubmit = vi.fn();
		const input = openDropdown(onSubmit);

		fireEvent.keyDown(input, { key: "Enter", shiftKey: true });

		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("does not submit while an IME composition is active", () => {
		const onSubmit = vi.fn();
		const input = openDropdown(onSubmit);

		fireEvent.keyDown(input, { key: "Enter", isComposing: true });

		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("ignores an empty prompt on Enter when empty is not allowed", () => {
		const onSubmit = vi.fn();
		const input = openDropdown(onSubmit, false);

		fireEvent.keyDown(input, { key: "Enter" });

		expect(onSubmit).not.toHaveBeenCalled();
	});
});
