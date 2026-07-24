// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { CardActionButtons } from "./CardActionButtons";
import type { SessionInfo } from "./types";
import { StarredSessionsProvider } from "./useStarredSessions";

afterEach(cleanup);

function Stars({ children }: { children: ReactNode }) {
	return (
		<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
			{children}
		</StarredSessionsProvider>
	);
}

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "3",
		name: "worktree session",
		commandType: "claude",
		status: "waiting",
		startedAt: 0,
		...overrides,
	};
}

describe("CardActionButtons dismiss visibility", () => {
	it("offers the plain dismiss on an ordinary waiting card", () => {
		render(
			<CardActionButtons
				session={session({ status: "waiting" })}
				loading={false}
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);

		expect(screen.queryByTitle("Dismiss session 3")).not.toBeNull();
	});

	it("withholds the plain dismiss while a card is stopped", () => {
		render(
			<CardActionButtons
				session={session({ status: "stopped" })}
				loading={false}
				onRestart={() => {}}
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);

		expect(screen.queryByTitle("Dismiss session 3")).toBeNull();
		expect(screen.queryByTitle("Restart")).not.toBeNull();
	});

	it("offers discard only when a stopped card holds undurable work", () => {
		const { rerender } = render(
			<CardActionButtons
				session={session({ status: "stopped" })}
				loading={false}
				onRestart={() => {}}
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);
		expect(
			screen.queryByTitle("Discard changes and remove worktree"),
		).toBeNull();

		rerender(
			<Stars>
				<CardActionButtons
					session={session({
						status: "stopped",
						undurable: { reason: "uncommitted changes" },
					})}
					loading={false}
					onRestart={() => {}}
					onDismiss={() => {}}
				/>
			</Stars>,
		);
		expect(
			screen.queryByTitle("Discard changes and remove worktree"),
		).not.toBeNull();
	});
});
