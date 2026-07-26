// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DiffToolbar } from "./DiffToolbar";

afterEach(cleanup);

function LocationProbe() {
	return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderToolbar() {
	render(
		<MemoryRouter initialEntries={["/sessions", "/diff"]} initialIndex={1}>
			<DiffToolbar
				viewType="unified"
				onChange={vi.fn()}
				search=""
				onSearchChange={vi.fn()}
				changeType="all"
				onChangeTypeChange={vi.fn()}
			/>
			<LocationProbe />
		</MemoryRouter>,
	);
}

describe("DiffToolbar", () => {
	it("returns to the previous page when closed", async () => {
		renderToolbar();
		expect(screen.getByTestId("location").textContent).toBe("/diff");

		fireEvent.click(screen.getByRole("button", { name: "Close" }));

		await waitFor(() =>
			expect(screen.getByTestId("location").textContent).toBe("/sessions"),
		);
	});
});
