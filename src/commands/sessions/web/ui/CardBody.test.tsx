// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CardBody } from "./CardBody";
import type { SessionInfo } from "./types";

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

	it("shows no counts while the card is starting or closing", async () => {
		renderBody(session({ closing: true }), true);

		await waitFor(() => expect(screen.getByText("Closing…")).toBeTruthy());
		expect(screen.queryByText("+1")).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});
});
