// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CardBody } from "./CardBody";
import type { SessionInfo } from "./types";

afterEach(() => {
	cleanup();
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
		...overrides,
	};
}

function renderBody(s: SessionInfo, loading: boolean) {
	render(
		<CardBody
			session={s}
			loading={loading}
			onSetAutoRun={vi.fn()}
			onSetAutoAdvance={vi.fn()}
		/>,
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
