// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { CardChips } from "./CardChips";
import { cloneBadgeSessionIds } from "./cloneBadgeSessionIds";
import type { SessionInfo } from "./types";
import { CloneBadgeContext } from "./useCloneBadgeContext";
import { InRepoGroupContext } from "./useInRepoGroupContext";
import { TopBarLayoutContext } from "./useTopBarLayoutContext";

afterEach(cleanup);

const session: SessionInfo = {
	id: "1",
	name: "my session",
	commandType: "claude",
	status: "running",
	startedAt: 0,
	cwd: "/home/me/assist",
};

function renderChips(topBar: boolean, grouped: boolean) {
	render(
		<MemoryRouter>
			<TopBarLayoutContext.Provider value={topBar}>
				<InRepoGroupContext.Provider value={grouped}>
					<CardChips session={session} />
				</InRepoGroupContext.Provider>
			</TopBarLayoutContext.Provider>
		</MemoryRouter>,
	);
}

describe("CardChips repo chip", () => {
	it("drops the repo chip when the group header already names it", () => {
		renderChips(true, true);

		expect(screen.queryByText("assist")).toBeNull();
	});

	it("keeps the repo chip on an ungrouped card", () => {
		renderChips(true, false);

		expect(screen.getByText("assist")).toBeTruthy();
	});

	it("keeps the repo chip in the default layout even inside a group", () => {
		renderChips(false, true);

		expect(screen.getByText("assist")).toBeTruthy();
	});
});

const repoGroup = {
	origin: "git@github.com:me/assist.git",
	clone: "/home/me/assist",
};

function cloneSession(id: string, cwd: string): SessionInfo {
	return { ...session, id, cwd, repoGroup };
}

function renderBadgeCard(visible: SessionInfo[], subject: SessionInfo) {
	render(
		<MemoryRouter>
			<TopBarLayoutContext.Provider value>
				<InRepoGroupContext.Provider value>
					<CloneBadgeContext.Provider value={cloneBadgeSessionIds(visible)}>
						<CardChips session={subject} />
					</CloneBadgeContext.Provider>
				</InRepoGroupContext.Provider>
			</TopBarLayoutContext.Provider>
		</MemoryRouter>,
	);
}

describe("CardChips clone badge", () => {
	const clone = cloneSession("1", "/home/me/assist");
	const worktree = cloneSession("2", "/home/me/assist-3");

	it("badges the clone session when a worktree sibling is visible", () => {
		renderBadgeCard([clone, worktree], clone);

		expect(screen.getByLabelText("Clone — /home/me/assist")).toBeTruthy();
	});

	it("leaves a worktree session unbadged", () => {
		renderBadgeCard([clone, worktree], worktree);

		expect(screen.queryByLabelText("Clone — /home/me/assist")).toBeNull();
	});

	it("leaves the clone unbadged when it is the repo's only session", () => {
		renderBadgeCard([clone], clone);

		expect(screen.queryByLabelText(/^Clone — /)).toBeNull();
	});

	it("leaves a session with no repo group unbadged", () => {
		const ungrouped: SessionInfo = { ...session, repoGroup: undefined };

		renderBadgeCard([ungrouped], ungrouped);

		expect(screen.queryByLabelText(/^Clone — /)).toBeNull();
	});
});
