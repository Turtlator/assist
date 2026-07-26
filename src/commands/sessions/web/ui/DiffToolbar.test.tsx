// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CommitRef } from "../../../../shared/db/listCommitRefs";
import { DiffToolbar } from "./DiffToolbar";

afterEach(cleanup);

function LocationProbe() {
	return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderToolbar({
	scope = "all",
	scopeCommits = [],
	onScopeChange = vi.fn(),
}: {
	scope?: string;
	scopeCommits?: CommitRef[];
	onScopeChange?: (scope: string) => void;
} = {}) {
	render(
		<MemoryRouter initialEntries={["/sessions", "/diff"]} initialIndex={1}>
			<DiffToolbar
				viewType="unified"
				onChange={vi.fn()}
				search=""
				onSearchChange={vi.fn()}
				changeType="all"
				onChangeTypeChange={vi.fn()}
				scope={scope}
				scopeCommits={scopeCommits}
				onScopeChange={onScopeChange}
			/>
			<LocationProbe />
		</MemoryRouter>,
	);
}

const commits: CommitRef[] = [
	{ sha: "aaaaaaabbbbbbb", title: "feat: the first commit" },
	{ sha: "cccccccddddddd" },
];

function openScopePicker(): HTMLElement {
	fireEvent.mouseDown(screen.getByRole("combobox", { name: "Scope" }));
	return screen.getByRole("listbox");
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

	it("hides the scope picker when the item has no recorded commits", () => {
		renderToolbar();

		expect(screen.queryByRole("combobox", { name: "Scope" })).toBeNull();
	});

	it("lists All, Uncommitted and one entry per commit", () => {
		renderToolbar({ scopeCommits: commits });

		const options = within(openScopePicker()).getAllByRole("option");

		expect(options.map((option) => option.textContent)).toEqual([
			"All",
			"Uncommitted",
			"feat: the first commit",
			"ccccccc",
		]);
	});

	it("defaults to All", () => {
		renderToolbar({ scopeCommits: commits });

		expect(screen.getByRole("combobox", { name: "Scope" }).textContent).toBe(
			"All",
		);
	});

	it("shows the selected commit by its subject", () => {
		renderToolbar({ scope: "aaaaaaabbbbbbb", scopeCommits: commits });

		expect(screen.getByRole("combobox", { name: "Scope" }).textContent).toBe(
			"feat: the first commit",
		);
	});

	it("falls back to All when the url names an unknown scope", () => {
		renderToolbar({ scope: "deadbeef", scopeCommits: commits });

		expect(screen.getByRole("combobox", { name: "Scope" }).textContent).toBe(
			"All",
		);
	});

	it("reports the chosen scope", () => {
		const onScopeChange = vi.fn();
		renderToolbar({ scopeCommits: commits, onScopeChange });

		fireEvent.click(
			within(openScopePicker()).getByRole("option", { name: "Uncommitted" }),
		);

		expect(onScopeChange).toHaveBeenCalledWith("uncommitted");
	});
});
