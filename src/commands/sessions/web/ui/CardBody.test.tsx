// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CardBody } from "./CardBody";
import type { SessionInfo } from "./types";
import { TopBarLayoutContext } from "./useTopBarLayoutContext";

beforeEach(() => {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => ({
			json: async () => ({
				new: ["a.ts"],
				modified: ["b.ts", "c.ts"],
				deleted: [],
			}),
		})),
	);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "5",
		name: "assist draft --once something",
		commandType: "assist",
		status: "running",
		startedAt: 0,
		runningMs: 0,
		runningSince: null,
		cwd: "/git/repo-2",
		...overrides,
	};
}

function renderBody(s: SessionInfo, loading: boolean) {
	render(
		<MemoryRouter>
			<CardBody
				session={s}
				loading={loading}
				onSetAutoRun={vi.fn()}
				onSetAutoAdvance={vi.fn()}
			/>
		</MemoryRouter>,
	);
}

describe("CardBody busy caption", () => {
	it("says Closing while the worktree is being torn down", () => {
		renderBody(session({ closing: true }), true);

		expect(screen.getByText("Closing…")).toBeTruthy();
		expect(screen.queryByText("Starting…")).toBeNull();
	});

	it("still says Starting for a session that is booting", () => {
		renderBody(session(), true);

		expect(screen.getByText("Starting…")).toBeTruthy();
		expect(screen.queryByText("Closing…")).toBeNull();
	});
});

describe("CardBody status caption", () => {
	const preview = {
		requestId: "req-1",
		title: "Bug title",
		body: "body",
		prNumber: null,
		kind: "backlog-item" as const,
	};

	it("says waiting while a proposed item sits in the preview pane", () => {
		renderBody(session({ pendingPrPreview: preview }), false);

		expect(screen.getByText("● waiting")).toBeTruthy();
		expect(screen.queryByText("● running")).toBeNull();
	});

	it("says running once the preview has been decided", () => {
		renderBody(session(), false);

		expect(screen.getByText("● running")).toBeTruthy();
	});
});

describe("CardBody git status counts", () => {
	it("links the card's own working-tree counts to that repo's diff", async () => {
		renderBody(session(), false);

		expect(await screen.findByText("+1")).toBeTruthy();
		expect(screen.getByText("~2")).toBeTruthy();
		expect(screen.queryByText("-0")).toBeNull();
		expect(screen.getByRole("link").getAttribute("href")).toBe(
			"/diff?cwd=%2Fgit%2Frepo-2",
		);
	});

	it("carries the claude session id into the counts request and the diff link", async () => {
		renderBody(session({ claudeSessionId: "sess-1" }), false);

		expect(await screen.findByText("+1")).toBeTruthy();
		expect(fetch).toHaveBeenCalledWith(
			"/api/git-status?cwd=%2Fgit%2Frepo-2&session=sess-1",
		);
		expect(screen.getByRole("link").getAttribute("href")).toBe(
			"/diff?cwd=%2Fgit%2Frepo-2&session=sess-1",
		);
	});

	it("shows no counts while the card is starting or closing", async () => {
		renderBody(session({ closing: true }), true);

		await waitFor(() => expect(screen.getByText("Closing…")).toBeTruthy());
		expect(screen.queryByText("+1")).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});
});

describe("CardBody top bar layout", () => {
	function renderWithTopBar(topBar: boolean) {
		render(
			<MemoryRouter>
				<TopBarLayoutContext.Provider value={topBar}>
					<CardBody
						session={session({ runningMs: 65_000, restored: true })}
						loading={false}
						onSetAutoRun={vi.fn()}
						onSetAutoAdvance={vi.fn()}
					/>
				</TopBarLayoutContext.Provider>
			</MemoryRouter>,
		);
	}

	it("keeps the status row in the default layout", async () => {
		renderWithTopBar(false);

		expect(screen.getByText("1m 5s")).toBeTruthy();
		expect(screen.getByText("restored")).toBeTruthy();
		expect(screen.getByText("● running")).toBeTruthy();
		expect(await screen.findByText("+1")).toBeTruthy();
	});

	it("drops the whole status row, which the chips line now carries", () => {
		renderWithTopBar(true);

		expect(screen.queryByText("1m 5s")).toBeNull();
		expect(screen.queryByText("restored")).toBeNull();
		expect(screen.queryByText("● running")).toBeNull();
		expect(screen.queryByText("+1")).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});
});
