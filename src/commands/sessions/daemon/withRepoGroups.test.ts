import { describe, expect, it, vi } from "vitest";
import type { HistoricalSession } from "../shared/parseSessionFile";
import { repoGroupForCwd } from "./repoGroupForCwd";
import { withRepoGroups } from "./withRepoGroups";

vi.mock("./repoGroupForCwd", () => ({ repoGroupForCwd: vi.fn() }));

const group = vi.mocked(repoGroupForCwd);

function session(cwd: string): HistoricalSession {
	return {
		sessionId: cwd,
		name: cwd,
		project: cwd,
		cwd,
		timestamp: "2026-07-25T00:00:00.000Z",
		origin: "wsl",
	};
}

describe("withRepoGroups", () => {
	it("attaches the resolved group to each session", () => {
		group.mockReturnValue({ origin: "host/org/repo", clone: "/git/repo" });

		expect(withRepoGroups([session("/git/repo-2")])[0]?.repoGroup).toEqual({
			origin: "host/org/repo",
			clone: "/git/repo",
		});
	});

	it("leaves a session untouched when its cwd resolves to no group", () => {
		group.mockReturnValue(undefined);
		const sessions = [session("/tmp/scratch")];

		expect(withRepoGroups(sessions)[0]).toBe(sessions[0]);
	});
});
