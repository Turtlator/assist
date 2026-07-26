// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionTopBar } from "./SessionTopBar";
import type { SessionInfo } from "./types";
import { StarredSessionsProvider } from "./useStarredSessions";

let panelWidth = 1200;

class TestResizeObserver {
	constructor(private readonly callback: ResizeObserverCallback) {}
	observe() {
		this.callback(
			[{ contentRect: { width: panelWidth } } as ResizeObserverEntry],
			this as unknown as ResizeObserver,
		);
	}
	unobserve() {}
	disconnect() {}
}

beforeEach(() => {
	panelWidth = 1200;
	globalThis.ResizeObserver =
		TestResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
	cleanup();
	Reflect.deleteProperty(globalThis, "ResizeObserver");
});

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "1",
		name: "my session",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		runningMs: 90_000,
		runningSince: null,
		...overrides,
	};
}

function renderTopBar(
	info: SessionInfo,
	handlers: {
		onRetry?: () => void;
		onRestart?: () => void;
		onDismiss?: () => void;
		onSetAutoAdvance?: (enabled: boolean) => void;
	} = {},
) {
	render(
		<MemoryRouter>
			<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
				<SessionTopBar
					session={info}
					onRetry={handlers.onRetry}
					onRestart={handlers.onRestart}
					onDismiss={handlers.onDismiss ?? (() => {})}
					onSetAutoRun={() => {}}
					onSetAutoAdvance={handlers.onSetAutoAdvance ?? (() => {})}
				/>
			</StarredSessionsProvider>
		</MemoryRouter>,
	);
}

describe("SessionTopBar", () => {
	it("shows the backlog phase name, elapsed and the restored indicator", () => {
		renderTopBar(
			session({
				subtitle: "a subtitle",
				restored: true,
				activity: {
					kind: "backlog",
					startedAt: 0,
					phaseName: "Phase 2: wire it up",
				},
			}),
		);

		expect(screen.getByText("Phase 2: wire it up")).toBeTruthy();
		expect(screen.getByText("1m 30s")).toBeTruthy();
		expect(screen.getByText("restored")).toBeTruthy();
	});

	it("falls back to the subtitle once the backlog session is done", () => {
		renderTopBar(
			session({
				status: "done",
				subtitle: "a subtitle",
				activity: {
					kind: "backlog",
					startedAt: 0,
					phaseName: "Phase 2: wire it up",
				},
			}),
		);

		expect(screen.getByText("a subtitle")).toBeTruthy();
		expect(screen.queryByText("Phase 2: wire it up")).toBeNull();
	});

	it("says not restored when the session could not be resumed", () => {
		renderTopBar(session({ restored: false }));

		expect(screen.getByText("not restored")).toBeTruthy();
	});

	it("omits the restored indicator when the session has no restore state", () => {
		renderTopBar(session());

		expect(screen.queryByText("restored")).toBeNull();
		expect(screen.queryByText("not restored")).toBeNull();
	});

	it("shows the story name alongside the phase", () => {
		renderTopBar(
			session({
				subtitle: "a subtitle",
				activity: {
					kind: "backlog",
					startedAt: 0,
					itemName: "Feature-flag the top bar",
					phaseName: "Phase 3: label the actions",
				},
			}),
		);

		expect(screen.getByText("Feature-flag the top bar")).toBeTruthy();
		expect(screen.getByText("Phase 3: label the actions")).toBeTruthy();
	});

	it("shows the assist session id and the Claude Code conversation id", () => {
		renderTopBar(
			session({
				id: "7",
				claudeSessionId: "2f1c0b8e-dead-beef-cafe-000000000001",
			}),
		);

		expect(screen.getByTitle("assist session 7")).toBeTruthy();
		expect(screen.getByText("#7")).toBeTruthy();
		expect(
			screen.getByText("2f1c0b8e-dead-beef-cafe-000000000001"),
		).toBeTruthy();
		expect(
			screen.getByTitle(
				"Claude Code conversation 2f1c0b8e-dead-beef-cafe-000000000001",
			),
		).toBeTruthy();
	});

	it("omits the conversation id before the harness reports one", () => {
		renderTopBar(session({ id: "7" }));

		expect(screen.getByText("#7")).toBeTruthy();
		expect(screen.queryByTitle(/Claude Code conversation/)).toBeNull();
	});

	it("links the backlog item ahead of the story name", () => {
		renderTopBar(
			session({
				cwd: "/git/repo",
				activity: {
					kind: "backlog",
					startedAt: 0,
					itemId: 1943,
					itemName: "Feature-flag the top bar",
				},
			}),
		);

		const chip = screen.getByRole("link");
		expect(chip.textContent).toBe("a1943");
		expect(chip.getAttribute("href")).toBe(
			"/backlog/items/a1943?cwd=%2Fgit%2Frepo",
		);

		const name = screen.getByText("Feature-flag the top bar");
		expect(
			chip.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	it("stacks the ids above the story name above the phase", () => {
		renderTopBar(
			session({
				id: "7",
				claudeSessionId: "conv-1",
				subtitle: "Phase 3: label the actions",
				activity: {
					kind: "backlog",
					startedAt: 0,
					itemName: "Feature-flag the top bar",
				},
			}),
		);

		const idRow = screen.getByText("#7").parentElement;
		const titleRow = screen.getByText("Feature-flag the top bar").parentElement;
		const phase = screen.getByText("Phase 3: label the actions");

		expect(screen.getByText("conv-1").parentElement).toBe(idRow);
		expect(titleRow).not.toBe(idRow);
		expect(titleRow?.parentElement).toBe(idRow?.parentElement);
		expect(phase.parentElement).toBe(idRow?.parentElement);
	});
});

describe("SessionTopBar actions", () => {
	it("carries the session's actions", () => {
		renderTopBar(session({ cwd: "/git/repo" }), {
			onRestart: () => {},
			onRetry: () => {},
		});

		expect(screen.queryByLabelText("Star")).not.toBeNull();
		expect(
			screen.queryAllByLabelText("Open in VS Code").length,
		).toBeGreaterThan(0);
		expect(screen.queryByTitle("Restart session 1")).not.toBeNull();
		expect(screen.queryByTitle("Retry session 1")).not.toBeNull();
	});

	it("invokes the handler behind an action", () => {
		const onRetry = vi.fn();
		renderTopBar(session(), { onRetry });

		fireEvent.click(screen.getByTitle("Retry session 1"));

		expect(onRetry).toHaveBeenCalled();
	});

	it("withholds restart from a stopped session so the card can offer it", () => {
		renderTopBar(session({ status: "stopped" }), { onRestart: () => {} });

		expect(screen.queryByTitle("Restart session 1")).toBeNull();
	});

	it("offers no close or dismiss of its own", () => {
		renderTopBar(session({ status: "waiting" }));

		expect(screen.queryByTitle("Dismiss session 1")).toBeNull();
	});
});

describe("SessionTopBar toggles", () => {
	it("carries the backlog session's continue switch", () => {
		const onSetAutoAdvance = vi.fn();
		renderTopBar(
			session({
				activity: { kind: "backlog", startedAt: 0, phase: 1, totalPhases: 3 },
			}),
			{ onSetAutoAdvance },
		);

		expect(screen.getByText("Continue")).toBeTruthy();

		fireEvent.click(screen.getByRole("switch"));

		expect(onSetAutoAdvance).toHaveBeenCalledWith(false);
	});

	it("offers no switch for a session with nothing to advance", () => {
		renderTopBar(session());

		expect(screen.queryByRole("switch")).toBeNull();
	});
});

describe("SessionTopBar action labels", () => {
	it("labels its actions when the panel is wide", () => {
		renderTopBar(session({ cwd: "/git/repo" }), {
			onRestart: () => {},
			onRetry: () => {},
		});

		expect(screen.getByText("Restart")).toBeTruthy();
		expect(screen.getByText("Retry")).toBeTruthy();
		expect(screen.getByText("Star")).toBeTruthy();
		expect(screen.getByText("VS Code")).toBeTruthy();
	});

	it("collapses to icons when the panel is narrow", () => {
		panelWidth = 400;
		renderTopBar(session({ cwd: "/git/repo" }), {
			onRestart: () => {},
			onRetry: () => {},
		});

		expect(screen.queryByText("Restart")).toBeNull();
		expect(screen.queryByText("Retry")).toBeNull();
		expect(screen.queryByText("Star")).toBeNull();
		expect(screen.queryByText("VS Code")).toBeNull();
	});

	it("keeps every action reachable once collapsed", () => {
		panelWidth = 400;
		const onRetry = vi.fn();
		renderTopBar(session({ cwd: "/git/repo" }), {
			onRestart: () => {},
			onRetry,
		});

		expect(screen.getByTitle("Restart session 1")).toBeTruthy();
		expect(screen.getByLabelText("Star")).toBeTruthy();
		expect(screen.getAllByLabelText("Open in VS Code").length).toBeGreaterThan(
			0,
		);

		fireEvent.click(screen.getByTitle("Retry session 1"));

		expect(onRetry).toHaveBeenCalled();
	});
});
