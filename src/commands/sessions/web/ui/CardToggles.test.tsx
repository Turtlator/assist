// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CardToggles } from "./CardToggles";
import type { SessionInfo } from "./types";
import { TopBarLayoutContext } from "./useTopBarLayoutContext";

afterEach(cleanup);

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "1",
		name: "a session",
		commandType: "assist",
		status: "running",
		startedAt: 0,
		activity: { kind: "backlog", startedAt: 0, phase: 1, totalPhases: 3 },
		...overrides,
	};
}

function renderToggles(
	topBar: boolean,
	info: SessionInfo,
	onSetAutoAdvance = vi.fn(),
) {
	render(
		<TopBarLayoutContext.Provider value={topBar}>
			<CardToggles
				session={info}
				onSetAutoRun={vi.fn()}
				onSetAutoAdvance={onSetAutoAdvance}
			/>
		</TopBarLayoutContext.Provider>,
	);
}

describe("CardToggles default layout", () => {
	it("keeps the switches on the card", () => {
		const onSetAutoAdvance = vi.fn();
		renderToggles(false, session(), onSetAutoAdvance);

		const toggle = screen.getByRole("switch");
		expect(screen.getByText("Continue")).toBeTruthy();

		fireEvent.click(toggle);

		expect(onSetAutoAdvance).toHaveBeenCalledWith(false);
	});

	it("offers auto-run instead on a draft session", () => {
		renderToggles(
			false,
			session({ assistArgs: ["draft"], activity: undefined }),
		);

		expect(screen.getByText("Auto-run")).toBeTruthy();
		expect(screen.queryByText("Continue")).toBeNull();
	});
});

describe("CardToggles top bar layout", () => {
	it("drops the switches from the card", () => {
		renderToggles(true, session());

		expect(screen.queryByRole("switch")).toBeNull();
		expect(screen.queryByText("Continue")).toBeNull();
	});

	it("collapses entirely while every toggle sits at its default", () => {
		const { container } = render(
			<TopBarLayoutContext.Provider value>
				<CardToggles
					session={session()}
					onSetAutoRun={vi.fn()}
					onSetAutoAdvance={vi.fn()}
				/>
			</TopBarLayoutContext.Provider>,
		);

		expect(container.textContent).toBe("");
	});

	it("captions continue once it is switched off", () => {
		renderToggles(true, session({ autoAdvance: false }));

		expect(screen.getByText("won't continue")).toBeTruthy();
	});

	it("captions dismiss once it is switched on in the review phase", () => {
		renderToggles(
			true,
			session({
				autoAdvance: true,
				activity: {
					kind: "backlog",
					startedAt: 0,
					phase: 3,
					totalPhases: 3,
				},
			}),
		);

		expect(screen.getByText("will dismiss")).toBeTruthy();
	});
});
