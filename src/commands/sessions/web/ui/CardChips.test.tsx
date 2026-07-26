// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { CardChips } from "./CardChips";
import type { SessionInfo } from "./types";
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
