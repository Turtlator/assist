// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionDiffSplit } from "./SessionDiffSplit";
import type { DiffPanelTarget } from "./toggleDiffPanel";
import { DiffPanelsProvider, useDiffPanels } from "./useDiffPanels";

vi.mock("./DiffContent", () => ({
	DiffContent: ({
		mode,
		onToggleMode,
	}: {
		mode?: string;
		onToggleMode?: () => void;
	}) => (
		<button type="button" data-testid="diff" onClick={onToggleMode}>
			{mode}
		</button>
	),
}));

afterEach(cleanup);

const target: DiffPanelTarget = { cwd: "/repo", scope: "all" };

function OpenPanelButton() {
	const { togglePanel } = useDiffPanels();
	return (
		<button type="button" onClick={() => togglePanel("card-1", target)}>
			open
		</button>
	);
}

function renderSplit() {
	render(
		<MemoryRouter>
			<DiffPanelsProvider onActivateSession={() => {}}>
				<OpenPanelButton />
				<SessionDiffSplit sessionId="card-1" sessions={[]} sendInput={() => {}}>
					<div data-testid="terminal" />
				</SessionDiffSplit>
			</DiffPanelsProvider>
		</MemoryRouter>,
	);
}

function terminalColumn(): HTMLElement {
	const column = screen.getByTestId("terminal").parentElement;
	if (column === null) throw new Error("terminal has no column");
	return column;
}

function widthOf(el: HTMLElement): string {
	return globalThis.getComputedStyle(el).width;
}

function displayOf(el: HTMLElement): string {
	return globalThis.getComputedStyle(el).display;
}

function diffColumn(): HTMLElement {
	const column = screen.getByTestId("diff").parentElement;
	if (column === null) throw new Error("diff has no column");
	return column;
}

function openPanel() {
	fireEvent.click(screen.getByRole("button", { name: "open" }));
}

describe("SessionDiffSplit", () => {
	it("gives the terminal the whole area while no panel is open", () => {
		renderSplit();

		expect(widthOf(terminalColumn())).toBe("100%");
		expect(screen.queryByTestId("diff")).toBeNull();
	});

	it("splits the area evenly in half mode", () => {
		renderSplit();
		openPanel();

		expect(widthOf(terminalColumn())).toBe("50%");
		expect(displayOf(terminalColumn())).toBe("flex");
		expect(widthOf(diffColumn())).toBe("50%");
	});

	it("collapses the terminal and fills the area in full mode", () => {
		renderSplit();
		openPanel();

		fireEvent.click(screen.getByTestId("diff"));

		expect(displayOf(terminalColumn())).toBe("none");
		expect(widthOf(diffColumn())).toBe("100%");
	});

	it("returns to the even split when full mode is turned off", () => {
		renderSplit();
		openPanel();

		fireEvent.click(screen.getByTestId("diff"));
		fireEvent.click(screen.getByTestId("diff"));

		expect(displayOf(terminalColumn())).toBe("flex");
		expect(widthOf(terminalColumn())).toBe("50%");
	});

	it("restores the terminal to full width when the panel closes", () => {
		renderSplit();
		openPanel();
		openPanel();

		expect(widthOf(terminalColumn())).toBe("100%");
	});
});
