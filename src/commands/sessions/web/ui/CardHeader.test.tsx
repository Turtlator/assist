// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

	it("leaves the awaiting-activity spinner bare, with no busy caption", () => {
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
		expect(screen.queryByText("Starting…")).toBeNull();
		expect(screen.queryByText("Closing…")).toBeNull();
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

describe("CardHeader busy caption", () => {
	function renderBusy(overrides: Partial<SessionInfo> = {}) {
		render(
			<CardHeader
				session={{ ...session, cwd: "/home/me/repo", ...overrides }}
				loading
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);
	}

	it("says Starting beside the single spinner for a booting session", () => {
		renderBusy();

		expect(screen.getAllByRole("progressbar").length).toBe(1);
		expect(screen.getByText("Starting…")).toBeTruthy();
		expect(screen.queryByText("Closing…")).toBeNull();
	});

	it("says Closing while the worktree is being torn down", () => {
		renderBusy({ closing: true });

		expect(screen.getAllByRole("progressbar").length).toBe(1);
		expect(screen.getByText("Closing…")).toBeTruthy();
		expect(screen.queryByText("Starting…")).toBeNull();
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

describe("CardHeader inline status", () => {
	const busy: SessionInfo = { ...session, cwd: "/home/me/repo", usedPct: 42 };

	beforeEach(() => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				json: async () => ({ new: ["a.ts"], modified: [], deleted: [] }),
			})),
		);
	});

	afterEach(() => vi.unstubAllGlobals());

	function renderHeader(topBar: boolean, loading = false) {
		render(
			<MemoryRouter>
				<TopBarLayoutContext.Provider value={topBar}>
					<CardHeader session={busy} loading={loading} onDismiss={() => {}} />
				</TopBarLayoutContext.Provider>
			</MemoryRouter>,
			{ wrapper: Stars },
		);
	}

	it("leaves status, context and counts to the body in the default layout", () => {
		renderHeader(false);

		expect(screen.queryByTitle("running")).toBeNull();
		expect(screen.queryByText("42%")).toBeNull();
	});

	it("keeps the status wordless, leaving the name to the top bar", () => {
		renderHeader(true);

		expect(screen.queryByText("● running")).toBeNull();
		expect(screen.getByTitle("running").textContent).toBe("●");
	});

	it("puts the dot, context and the diff counts on the chips line", async () => {
		renderHeader(true);

		expect(await screen.findByText("+1")).toBeTruthy();

		const chip = screen.getByText("repo").closest(".MuiChip-root");
		const row = chip?.parentElement;
		expect(row?.textContent).toContain("●");
		expect(row?.textContent).toContain("42%");
		expect(row?.textContent).toContain("+1");
		expect(row?.textContent).not.toContain("my session");
	});

	it("leads the chips with the dot and trails them with the rest", async () => {
		renderHeader(true);

		const dot = screen.getByTitle("running");
		const context = await screen.findByText("42%");
		const row = screen
			.getByText("repo")
			.closest(".MuiChip-root")?.parentElement;
		const chips = row?.querySelectorAll(".MuiChip-root") ?? [];
		const buttons = row?.querySelectorAll("button") ?? [];
		const follows = (from: Node, to: Node) =>
			Boolean(
				from.compareDocumentPosition(to) & Node.DOCUMENT_POSITION_FOLLOWING,
			);

		expect(chips.length).toBeGreaterThan(0);
		expect(buttons.length).toBeGreaterThan(0);
		expect(follows(dot, chips[0] as Node)).toBe(true);
		expect(follows(chips[chips.length - 1] as Node, context)).toBe(true);
		expect(follows(context, buttons[buttons.length - 1] as Node)).toBe(true);
	});

	it("holds the status back while the card is still starting", () => {
		renderHeader(true, true);

		expect(screen.getByRole("progressbar")).toBeTruthy();
		expect(screen.queryByTitle("running")).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});
});
