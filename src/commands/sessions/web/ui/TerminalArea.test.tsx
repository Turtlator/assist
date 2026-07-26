// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./TerminalPane", () => ({
	TerminalPane: ({ sessionId }: { sessionId: string }) => (
		<div data-testid={`pane-${sessionId}`} />
	),
}));

import { TerminalArea } from "./TerminalArea";
import type { SessionInfo, SessionLifecycleHandlers } from "./types";
import { StarredSessionsProvider } from "./useStarredSessions";
import { TopBarLayoutContext } from "./useTopBarLayoutContext";

afterEach(cleanup);

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "1",
		name: "my session",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		runningMs: 5_000,
		runningSince: null,
		subtitle: "first subtitle",
		...overrides,
	};
}

function renderArea(
	topBar: boolean,
	sessions: SessionInfo[],
	activeId: string,
	lifecycle: Partial<SessionLifecycleHandlers> = {},
) {
	render(
		<TopBarLayoutContext.Provider value={topBar}>
			<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
				<TerminalArea
					sessions={sessions}
					activeId={activeId}
					initialized={new Set(sessions.map((s) => s.id))}
					onOutput={() => () => {}}
					sendInput={vi.fn()}
					sendResize={vi.fn()}
					lifecycle={{
						onRetry: vi.fn(),
						onRestart: vi.fn(),
						onDismiss: vi.fn(),
						...lifecycle,
					}}
				/>
			</StarredSessionsProvider>
		</TopBarLayoutContext.Provider>,
	);
}

describe("TerminalArea top bar", () => {
	it("shows the active session's phase and elapsed when the flag is on", () => {
		renderArea(true, [session()], "1");

		expect(screen.getByText("first subtitle")).toBeTruthy();
		expect(screen.getByText("5s")).toBeTruthy();
	});

	it("renders no top bar when the flag is off", () => {
		renderArea(false, [session()], "1");

		expect(screen.queryByText("first subtitle")).toBeNull();
		expect(screen.queryByText("5s")).toBeNull();
	});

	it("renders no top bar when no session is active", () => {
		renderArea(true, [session()], "other");

		expect(screen.queryByText("first subtitle")).toBeNull();
	});

	it("follows the active session when it changes", () => {
		const sessions = [
			session(),
			session({ id: "2", subtitle: "second subtitle", runningMs: 65_000 }),
		];
		renderArea(true, sessions, "2");

		expect(screen.getByText("second subtitle")).toBeTruthy();
		expect(screen.getByText("1m 5s")).toBeTruthy();
		expect(screen.queryByText("first subtitle")).toBeNull();
	});
});

describe("TerminalArea top bar actions", () => {
	it("restarts the active session", () => {
		const onRestart = vi.fn();
		renderArea(true, [session(), session({ id: "2" })], "2", { onRestart });

		fireEvent.click(screen.getByTitle("Restart session 2"));
		fireEvent.click(screen.getByRole("button", { name: "Restart" }));

		expect(onRestart).toHaveBeenCalledWith("2");
	});

	it("retries the active session", () => {
		const onRetry = vi.fn();
		renderArea(true, [session({ commandType: "run" })], "1", { onRetry });

		fireEvent.click(screen.getByTitle("Retry session 1"));

		expect(onRetry).toHaveBeenCalledWith("1");
	});

	it("offers no retry on a session that cannot be retried", () => {
		renderArea(true, [session()], "1");

		expect(screen.queryByTitle("Retry session 1")).toBeNull();
	});

	it("keeps the actions out of the terminal panel when the flag is off", () => {
		renderArea(false, [session()], "1");

		expect(screen.queryByTitle("Restart session 1")).toBeNull();
	});

	it("leaves close and dismiss to the card", () => {
		renderArea(true, [session({ status: "waiting" })], "1");

		expect(screen.queryByTitle("Dismiss session 1")).toBeNull();
	});
});
