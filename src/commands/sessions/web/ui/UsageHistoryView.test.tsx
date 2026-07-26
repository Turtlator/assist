// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UsagePeakRow } from "../../../../shared/db/listUsagePeaks";
import { UsageHistoryView } from "./UsageHistoryView";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

const peak: UsagePeakRow = {
	window: "five_hour",
	resetsAt: 1_800_000_000,
	segment: 0,
	usedPercentage: 42,
	resetDetected: false,
	tokensUp: 1_000,
	tokensDown: 2_000,
	createdAt: new Date("2026-07-01T00:00:00Z"),
	avgContextPct: 30,
	phaseCount: 4,
};

type HistoryPage = { rows: UsagePeakRow[]; total: number };

function stubHistory(pages: Record<string, HistoryPage>) {
	const fetchMock = vi.fn(async (url: string) => {
		const window =
			new URL(url, "http://localhost").searchParams.get("window") ?? "all";
		return {
			ok: true,
			status: 200,
			json: async () => pages[window] ?? { rows: [], total: 0 },
		};
	});
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

describe("UsageHistoryView", () => {
	it("keeps the toggle visible and names the window when the filter matches nothing", async () => {
		const fetchMock = stubHistory({ all: { rows: [peak], total: 1 } });
		render(<UsageHistoryView />);

		await waitFor(() => expect(screen.getByText("Window")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "7d" }));

		await waitFor(() =>
			expect(screen.getByText("No 7d usage peaks recorded yet.")).toBeTruthy(),
		);
		expect(screen.getByRole("button", { name: "All" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "7d" })).toBeTruthy();
		expect(screen.queryByText("Window")).toBeNull();
		expect(fetchMock).toHaveBeenLastCalledWith(
			"/api/usage/history?page=0&pageSize=30&window=seven_day",
		);
	});

	it("returns to the unfiltered rows when All is picked again", async () => {
		stubHistory({ all: { rows: [peak], total: 1 } });
		render(<UsageHistoryView />);

		await waitFor(() => expect(screen.getByText("Window")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "7d" }));
		await waitFor(() =>
			expect(screen.getByText("No 7d usage peaks recorded yet.")).toBeTruthy(),
		);
		fireEvent.click(screen.getByRole("button", { name: "All" }));

		await waitFor(() => expect(screen.getByText("Window")).toBeTruthy());
		expect(screen.queryByText("No 7d usage peaks recorded yet.")).toBeNull();
	});

	it("keeps the generic wording when nothing is recorded at all", async () => {
		stubHistory({});
		render(<UsageHistoryView />);

		await waitFor(() =>
			expect(screen.getByText("No usage peaks recorded yet.")).toBeTruthy(),
		);
		expect(screen.queryByText("No 5h usage peaks recorded yet.")).toBeNull();
	});
});
