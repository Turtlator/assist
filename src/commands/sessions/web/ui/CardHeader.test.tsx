// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { CardHeader } from "./CardHeader";
import type { SessionInfo } from "./types";
import { StarredSessionsProvider } from "./useStarredSessions";
import { TopBarLayoutContext } from "./useTopBarLayoutContext";

afterEach(cleanup);

const session: SessionInfo = {
	id: "1",
	name: "my session",
	commandType: "claude",
	status: "running",
	startedAt: 0,
};

function Stars({ children }: { children: ReactNode }) {
	return (
		<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
			{children}
		</StarredSessionsProvider>
	);
}

describe("CardHeader prompt", () => {
	it("clamps the prompt to 5 lines with hidden overflow", () => {
		render(
			<CardHeader session={session} loading={false} onDismiss={() => {}} />,
			{ wrapper: Stars },
		);

		const style = getComputedStyle(screen.getByText("my session"));
		expect(style.getPropertyValue("-webkit-line-clamp")).toBe("5");
		expect(style.overflow).toBe("hidden");
	});
});

describe("CardHeader loading", () => {
	it("shows a spinner instead of chips while starting", () => {
		const starting: SessionInfo = { ...session, cwd: "/home/me/repo" };
		render(<CardHeader session={starting} loading onDismiss={() => {}} />, {
			wrapper: Stars,
		});

		expect(screen.getByRole("progressbar")).toBeTruthy();
		expect(screen.queryByText("repo")).toBeNull();
	});

	it("shows chips and no spinner once loaded", () => {
		const loaded: SessionInfo = { ...session, cwd: "/home/me/repo" };
		render(
			<CardHeader session={loaded} loading={false} onDismiss={() => {}} />,
			{ wrapper: Stars },
		);

		expect(screen.queryByRole("progressbar")).toBeNull();
		expect(screen.getByText("repo")).toBeTruthy();
	});

	it("keeps the spinner for an assist session until its activity resolves", () => {
		const pending: SessionInfo = {
			...session,
			commandType: "assist",
			assistArgs: ["next-backlog-item"],
			cwd: "/home/me/repo",
		};
		render(
			<CardHeader session={pending} loading={false} onDismiss={() => {}} />,
			{ wrapper: Stars },
		);

		expect(screen.getByRole("progressbar")).toBeTruthy();
		expect(screen.queryByText("repo")).toBeNull();
	});

	it("shows chips once an assist session's activity arrives", () => {
		const resolved: SessionInfo = {
			...session,
			commandType: "assist",
			assistArgs: ["next-backlog-item"],
			cwd: "/home/me/repo",
			activity: { kind: "command", startedAt: 0 },
		};
		render(
			<CardHeader session={resolved} loading={false} onDismiss={() => {}} />,
			{ wrapper: Stars },
		);

		expect(screen.queryByRole("progressbar")).toBeNull();
		expect(screen.getByText("repo")).toBeTruthy();
	});

	it("does not hang the spinner on a finished assist session with no activity", () => {
		const done: SessionInfo = {
			...session,
			commandType: "assist",
			assistArgs: ["draft"],
			cwd: "/home/me/repo",
			status: "done",
		};
		render(<CardHeader session={done} loading={false} onDismiss={() => {}} />, {
			wrapper: Stars,
		});

		expect(screen.queryByRole("progressbar")).toBeNull();
		expect(screen.getByText("repo")).toBeTruthy();
	});
});

describe("CardHeader phase caption", () => {
	const phased: SessionInfo = {
		...session,
		activity: { kind: "backlog", startedAt: 0, phaseName: "Phase 1: flag" },
	};

	function renderHeader(topBar: boolean) {
		render(
			<TopBarLayoutContext.Provider value={topBar}>
				<CardHeader session={phased} loading={false} onDismiss={() => {}} />
			</TopBarLayoutContext.Provider>,
			{ wrapper: Stars },
		);
	}

	it("shows the phase caption in the default layout", () => {
		renderHeader(false);

		expect(screen.getByText("Phase 1: flag")).toBeTruthy();
	});

	it("drops the phase caption when the top bar owns it", () => {
		renderHeader(true);

		expect(screen.queryByText("Phase 1: flag")).toBeNull();
		expect(screen.getByText("my session")).toBeTruthy();
	});
});
