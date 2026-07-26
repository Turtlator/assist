// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ItemStatusCounts } from "../gitStatus";
import { GitStatusCounts } from "./GitStatusCounts";
import { useGitStatusCounts } from "./useGitStatusCounts";

vi.mock("./useGitStatusCounts", () => ({ useGitStatusCounts: vi.fn() }));

const useGitStatusCountsMock = vi.mocked(useGitStatusCounts);

afterEach(cleanup);

function renderCounts(counts: ItemStatusCounts | null): void {
	useGitStatusCountsMock.mockReturnValue(counts);
	render(
		<MemoryRouter>
			<GitStatusCounts cwd="/repo" sessionId="sess-1" />
		</MemoryRouter>,
	);
}

function links(): { text: string; href: string }[] {
	return screen.queryAllByRole("link").map((link) => ({
		text: link.textContent ?? "",
		href: link.getAttribute("href") ?? "",
	}));
}

describe("GitStatusCounts", () => {
	it("shows the item counts with the uncommitted subset in brackets", () => {
		renderCounts({
			new: ["a.ts", "b.ts", "c.ts", "d.ts", "e.ts"],
			modified: ["f.ts", "g.ts", "h.ts", "i.ts", "j.ts"],
			deleted: ["k.ts"],
			uncommitted: { new: ["e.ts"], modified: ["j.ts"], deleted: [] },
			hasCommits: true,
		});

		expect(links()).toEqual([
			{ text: "+5~5-1", href: "/diff?cwd=%2Frepo&session=sess-1" },
			{
				text: "(+1~1)",
				href: "/diff?cwd=%2Frepo&session=sess-1&scope=uncommitted",
			},
		]);
	});

	it("shows only the unbracketed counts when the tree is clean", () => {
		renderCounts({
			new: ["a.ts"],
			modified: [],
			deleted: [],
			uncommitted: { new: [], modified: [], deleted: [] },
			hasCommits: true,
		});

		expect(links()).toEqual([
			{ text: "+1", href: "/diff?cwd=%2Frepo&session=sess-1" },
		]);
	});

	it("shows a single unbracketed group when the item has no commits", () => {
		renderCounts({ new: [], modified: ["a.ts"], deleted: [] });

		expect(links()).toEqual([
			{ text: "~1", href: "/diff?cwd=%2Frepo&session=sess-1" },
		]);
	});

	it("renders nothing when there is nothing to show", () => {
		renderCounts({
			new: [],
			modified: [],
			deleted: [],
			uncommitted: { new: [], modified: [], deleted: [] },
			hasCommits: true,
		});

		expect(links()).toEqual([]);
	});

	it("renders nothing before the first poll answers", () => {
		renderCounts(null);

		expect(links()).toEqual([]);
	});
});
