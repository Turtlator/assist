import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	loadPersistedSessions,
	type PersistedSession,
} from "../loadPersistedSessions";
import { persistedTreeRoots } from "./persistedTreeRoots";

vi.mock("../loadPersistedSessions", () => ({
	loadPersistedSessions: vi.fn(() => []),
}));
vi.mock("../../../../shared/findRepoRoot", () => ({
	findRepoRoot: (cwd: string) =>
		cwd.endsWith("/src") ? cwd.slice(0, -4) : cwd,
}));

const loadMock = vi.mocked(loadPersistedSessions);

function persisted(cwd: string): PersistedSession {
	return {
		name: "s",
		commandType: "assist",
		status: "running",
		cwd,
		startedAt: 1,
	};
}

describe("persistedTreeRoots", () => {
	beforeEach(() => vi.clearAllMocks());

	it("holds the tree of every persisted card", () => {
		loadMock.mockReturnValue([
			persisted("/git/repo"),
			persisted("/git/repo-2"),
		]);

		expect(persistedTreeRoots()).toEqual(new Set(["/git/repo", "/git/repo-2"]));
	});

	it("resolves a card started in a subdirectory to its tree root", () => {
		loadMock.mockReturnValue([persisted("/git/repo-2/src")]);

		expect(persistedTreeRoots()).toEqual(new Set(["/git/repo-2"]));
	});

	it("holds nothing when no card is persisted", () => {
		loadMock.mockReturnValue([]);

		expect(persistedTreeRoots()).toEqual(new Set());
	});
});
