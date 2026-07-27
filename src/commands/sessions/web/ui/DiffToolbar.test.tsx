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
	scopeBranchBase = null,
	onScopeChange = vi.fn(),
	commentHint,
}: {
	scope?: string;
	scopeCommits?: CommitRef[];
	scopeBranchBase?: string | null;
	onScopeChange?: (scope: string) => void;
	commentHint?: string;
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
				scope={{
					scope,
					commits: scopeCommits,
					branchBase: scopeBranchBase,
				}}
				onScopeChange={onScopeChange}
				commentHint={commentHint}
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

	it("shows the scope picker when the item has no recorded commits", () => {
		renderToolbar();

		const options = within(openScopePicker()).getAllByRole("option");

		expect(options.map((option) => option.textContent)).toEqual([
			"All",
			"Uncommitted",
		]);
	});

	it("lists All, Uncommitted, Branch and one entry per commit", () => {
		renderToolbar({ scopeCommits: commits, scopeBranchBase: "origin/main" });

		const options = within(openScopePicker()).getAllByRole("option");

		expect(options.map((option) => option.textContent)).toEqual([
			"All",
			"Uncommitted",
			"Branch (origin/main)",
			"feat: the first commit",
			"ccccccc",
		]);
	});

	it("omits the Branch option when no branch base resolves", () => {
		renderToolbar({ scopeCommits: commits });

		const options = within(openScopePicker()).getAllByRole("option");

		expect(options.map((option) => option.textContent)).toEqual([
			"All",
			"Uncommitted",
			"feat: the first commit",
			"ccccccc",
		]);
	});

	it("shows the selected branch scope by its base ref", () => {
		renderToolbar({ scope: "branch", scopeBranchBase: "origin/main" });

		expect(screen.getByRole("combobox", { name: "Scope" }).textContent).toBe(
			"Branch (origin/main)",
		);
	});

	it("falls back to All when branch is selected without a branch base", () => {
		renderToolbar({ scope: "branch" });

		expect(screen.getByRole("combobox", { name: "Scope" }).textContent).toBe(
			"All",
		);
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

	it("explains why commenting is unavailable", () => {
		renderToolbar({ commentHint: "no live session" });

		expect(screen.getByText("no live session")).toBeTruthy();
	});

	it("shows no hint when commenting is available", () => {
		renderToolbar();

		expect(screen.queryByText(/session/)).toBeNull();
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
