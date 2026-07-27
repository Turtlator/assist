import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HistoricalSession } from "../shared/parseSessionFile";
import { repoDirExists } from "./repoDirExists";
import { repoGroupForCwd } from "./repoGroupForCwd";
import { withRepoGroups } from "./withRepoGroups";

vi.mock("./repoGroupForCwd", () => ({ repoGroupForCwd: vi.fn() }));
vi.mock("./repoDirExists", () => ({ repoDirExists: vi.fn() }));

const group = vi.mocked(repoGroupForCwd);
const exists = vi.mocked(repoDirExists);

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
	beforeEach(() => {
		exists.mockReset();
		exists.mockReturnValue(true);
	});

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

	it("flags a session whose ungrouped cwd no longer exists on disk", () => {
		group.mockReturnValue(undefined);
		exists.mockReturnValue(false);

		expect(withRepoGroups([session("/git/repo-2")])[0]).toMatchObject({
			cwd: "/git/repo-2",
			cwdMissing: true,
		});
	});

	it("flags a grouped session whose clone no longer exists on disk", () => {
		group.mockReturnValue({ origin: "host/org/repo", clone: "/git/repo" });
		exists.mockImplementation((dir) => dir !== "/git/repo");

		expect(withRepoGroups([session("/git/repo-wt")])[0]?.cwdMissing).toBe(true);
	});

	it("does not flag a grouped session whose clone still exists", () => {
		group.mockReturnValue({ origin: "host/org/repo", clone: "/git/repo" });

		expect(withRepoGroups([session("/git/repo-wt")])[0]?.cwdMissing).toBe(
			undefined,
		);
	});

	it("checks each distinct directory once", () => {
		group.mockReturnValue(undefined);
		withRepoGroups([session("/git/repo"), session("/git/repo")]);

		expect(exists).toHaveBeenCalledTimes(1);
	});
});
