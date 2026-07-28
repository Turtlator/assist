// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CardPrActions } from "./CardPrActions";
import type { SessionInfo } from "./types";
import { TopBarLayoutContext } from "./useTopBarLayoutContext";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "5",
		name: "assist review-pr-comments 12",
		commandType: "assist",
		assistArgs: ["review-pr-comments", "12"],
		status: "running",
		startedAt: 0,
		runningMs: 0,
		runningSince: null,
		cwd: "/git/repo",
		...overrides,
	};
}

function stubFetch({ pr, synthesis }: { pr: boolean; synthesis: boolean }) {
	vi.stubGlobal(
		"fetch",
		vi.fn(async (url: string) => {
			if (url.startsWith("/api/review/synthesis"))
				return synthesis
					? { ok: true, status: 200, json: async () => ({ synthesis: "## f" }) }
					: { ok: false, status: 404, json: async () => ({}) };
			return {
				ok: true,
				status: 200,
				json: async () => ({
					pr: pr
						? {
								number: 12,
								title: "Add a thing",
								author: "someone",
								createdAt: new Date(0).toISOString(),
								url: "https://github.com/org/repo/pull/12",
							}
						: null,
				}),
			};
		}),
	);
}

function renderActions(topBar: boolean, s: SessionInfo = session()) {
	render(
		<TopBarLayoutContext.Provider value={topBar}>
			<CardPrActions session={s} />
		</TopBarLayoutContext.Provider>,
	);
}

const reviewButton = () => screen.findByRole("button", { name: "Review PR" });
const findingsButton = () =>
	screen.findByRole("button", { name: "View review findings" });

describe("CardPrActions review pairing", () => {
	it("stacks the findings button under the review button in the top bar", async () => {
		stubFetch({ pr: true, synthesis: true });
		renderActions(true);

		const review = await reviewButton();
		const findings = await findingsButton();

		expect(findings.parentElement).toBe(review.parentElement);
		const style = getComputedStyle(review.parentElement as Element);
		expect(style.flexDirection).toBe("column");
		expect(style.borderTopStyle).toBe("none");
		expect(style.gap).toBe("");
	});

	it("keeps the pair inline in the card header row", async () => {
		stubFetch({ pr: true, synthesis: true });
		renderActions(false);

		const review = await reviewButton();
		await findingsButton();

		expect(
			getComputedStyle(review.parentElement as Element).flexDirection,
		).toBe("row");
	});

	it("leaves the review button alone when there are no findings", async () => {
		stubFetch({ pr: true, synthesis: false });
		renderActions(true);

		const review = await reviewButton();

		await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
		expect(
			screen.queryByRole("button", { name: "View review findings" }),
		).toBeNull();
		expect(review.parentElement?.childElementCount).toBe(1);
	});

	it("still shows the findings button when the session has no PR", async () => {
		stubFetch({ pr: false, synthesis: true });
		renderActions(true);

		expect(await findingsButton()).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Review PR" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Open PR" })).toBeNull();
	});
});
