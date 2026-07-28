// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BacklogItemSummary } from "../../../backlog/web/ui/types";
import { cloneBadgeSessionIds } from "./cloneBadgeSessionIds";
import type { SessionInfo } from "./types";
import { CloneBadgeContext } from "./useCloneBadgeContext";
import { InRepoGroupContext } from "./useInRepoGroupContext";
import { TopBarLayoutContext } from "./useTopBarLayoutContext";

vi.mock("../../../backlog/web/ui/components/useJiraSite", () => ({
	useJiraSite: () => "acme.atlassian.net",
}));

import { CardChips } from "./CardChips";

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

function trackerItem(tracker: Partial<BacklogItemSummary>): BacklogItemSummary {
	return {
		id: 7,
		type: "story",
		name: "Login flow",
		status: "todo",
		starred: false,
		incompleteSubtasks: 0,
		...tracker,
	};
}

async function renderTrackerCard(
	cwd: string,
	items: BacklogItemSummary[],
	itemId = 7,
) {
	vi.stubGlobal(
		"fetch",
		vi.fn(() => Promise.resolve({ json: () => Promise.resolve(items) })),
	);
	const trackerSession: SessionInfo = {
		...session,
		cwd,
		activity: { kind: "backlog", itemId, startedAt: 0 },
	};
	await act(async () => {
		render(
			<MemoryRouter>
				<TopBarLayoutContext.Provider value={false}>
					<InRepoGroupContext.Provider value={false}>
						<CardChips session={trackerSession} />
					</InRepoGroupContext.Provider>
				</TopBarLayoutContext.Provider>
			</MemoryRouter>,
		);
	});
}

afterEach(() => vi.unstubAllGlobals());

describe("CardChips tracker chip", () => {
	it("shortens a GitHub issue from the item's own origin", async () => {
		await renderTrackerCard("/home/me/gh-own", [
			trackerItem({
				origin: "github.com/acme/widgets",
				githubIssue: "acme/widgets#123",
			}),
		]);

		const link = await screen.findByRole("link", { name: "#123" });
		expect(link.getAttribute("href")).toBe(
			"https://github.com/acme/widgets/issues/123",
		);
	});

	it("keeps the full owner/repo#N when the issue is from another repo", async () => {
		await renderTrackerCard("/home/me/gh-other", [
			trackerItem({
				origin: "github.com/acme/widgets",
				githubIssue: "other/thing#7",
			}),
		]);

		const link = await screen.findByRole("link", { name: "other/thing#7" });
		expect(link.getAttribute("href")).toBe(
			"https://github.com/other/thing/issues/7",
		);
	});

	it("still renders the Jira chip for a Jira-associated item", async () => {
		await renderTrackerCard("/home/me/jira", [
			trackerItem({ jiraKey: "BAD-671" }),
		]);

		const link = await screen.findByRole("link", { name: "BAD-671" });
		expect(link.getAttribute("href")).toBe(
			"https://acme.atlassian.net/browse/BAD-671",
		);
	});

	it("renders no tracker chip for an item with neither", async () => {
		await renderTrackerCard("/home/me/none", [trackerItem({})]);

		const external = screen
			.getAllByRole("link")
			.filter((link) => link.getAttribute("href")?.startsWith("https://"));
		expect(external).toEqual([]);
	});
});
