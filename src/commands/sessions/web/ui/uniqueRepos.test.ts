import { describe, expect, it } from "vitest";
import type { HistoricalSession } from "./types";
import { uniqueRepos } from "./uniqueRepos";

function session(cwd: string): HistoricalSession {
	return {
		sessionId: cwd,
		name: cwd,
		project: cwd,
		cwd,
		timestamp: cwd,
	};
}

describe("uniqueRepos", () => {
	it("orders repos by most recent session, newest first", () => {
		const history = [
			session("/repo/c"),
			session("/repo/a"),
			session("/repo/b"),
		];
		expect(uniqueRepos("/repo/a", history)).toEqual([
			"/repo/c",
			"/repo/a",
			"/repo/b",
		]);
	});

	it("places the cwd at the top when it has no matching session", () => {
		const history = [session("/repo/a"), session("/repo/b")];
		expect(uniqueRepos("/repo/new", history)).toEqual([
			"/repo/new",
			"/repo/a",
			"/repo/b",
		]);
	});

	it("lets the cwd fall into its recency slot when it has a session", () => {
		const history = [
			session("/repo/a"),
			session("/repo/b"),
			session("/repo/c"),
		];
		expect(uniqueRepos("/repo/b", history)).toEqual([
			"/repo/a",
			"/repo/b",
			"/repo/c",
		]);
	});

	it("de-dupes repos, keeping the newest occurrence", () => {
		const history = [
			session("/repo/a"),
			session("/repo/b"),
			session("/repo/a"),
			session("/repo/c"),
			session("/repo/b"),
		];
		expect(uniqueRepos("", history)).toEqual(["/repo/a", "/repo/b", "/repo/c"]);
	});

	it("ignores sessions without a cwd", () => {
		const history = [
			session("/repo/a"),
			{ ...session(""), cwd: "" },
			session("/repo/b"),
		];
		expect(uniqueRepos("", history)).toEqual(["/repo/a", "/repo/b"]);
	});

	it("returns an empty list when there is no cwd or history", () => {
		expect(uniqueRepos("", [])).toEqual([]);
	});

	it("lists a clone and its worktrees as one entry, pointing at the clone", () => {
		const group = { origin: "host/org/assist", clone: "/git/assist" };
		const history = [
			{ ...session("/git/assist-2"), repoGroup: group },
			{ ...session("/git/assist"), repoGroup: group },
			{ ...session("/git/assist-3"), repoGroup: group },
		];

		expect(uniqueRepos("", history)).toEqual(["/git/assist"]);
	});

	it("does not add the cwd again when a session already places it in a group", () => {
		const group = { origin: "host/org/assist", clone: "/git/assist" };
		const history = [
			{ ...session("/git/assist"), repoGroup: group },
			{ ...session("/git/assist-2"), repoGroup: group },
		];

		expect(uniqueRepos("/git/assist-2", history)).toEqual(["/git/assist"]);
	});

	it("keeps a windows checkout separate from its wsl counterpart", () => {
		const history = [
			{
				...session("/git/assist"),
				repoGroup: { origin: "host/org/assist", clone: "/git/assist" },
			},
			{
				...session(String.raw`C:\git\assist`),
				repoGroup: {
					origin: "windows:host/org/assist",
					clone: String.raw`C:\git\assist`,
				},
			},
		];

		expect(uniqueRepos("", history)).toEqual([
			"/git/assist",
			String.raw`C:\git\assist`,
		]);
	});
});
