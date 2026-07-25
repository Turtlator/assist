import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadJson, saveJson } from "../../../../shared/loadJson";
import {
	forgetWorktree,
	readWorktreeRegistry,
	recordWorktree,
	worktreeAttributionIncludingReaped,
} from "./readWorktreeRegistry";

vi.mock("../../../../shared/loadJson", () => ({
	loadJson: vi.fn(),
	saveJson: vi.fn(),
}));

const load = vi.mocked(loadJson);
const save = vi.mocked(saveJson);

let store: Record<string, unknown>;

beforeEach(() => {
	store = {};
	load.mockReset();
	save.mockReset();
	load.mockImplementation(() => structuredClone(store) as never);
	save.mockImplementation((_file, data) => {
		store = structuredClone(data) as Record<string, unknown>;
	});
});

describe("worktree registry", () => {
	it("lists recorded worktrees", () => {
		recordWorktree("/git/repo-2", "/git/repo", "host/org/repo");

		expect(readWorktreeRegistry()).toEqual([
			{ path: "/git/repo-2", clone: "/git/repo", origin: "host/org/repo" },
		]);
	});

	it("drops a reaped worktree from the live listing", () => {
		recordWorktree("/git/repo-2", "/git/repo", "host/org/repo");
		forgetWorktree("/git/repo-2");

		expect(readWorktreeRegistry()).toEqual([]);
	});

	it("keeps attributing a reaped worktree to its clone", () => {
		recordWorktree("/git/repo-2", "/git/repo", "host/org/repo");
		forgetWorktree("/git/repo-2");

		expect(worktreeAttributionIncludingReaped("/git/repo-2")).toEqual({
			clone: "/git/repo",
			origin: "host/org/repo",
		});
	});

	it("revives the record when the same path is allocated again", () => {
		recordWorktree("/git/repo-2", "/git/repo", "host/org/repo");
		forgetWorktree("/git/repo-2");
		recordWorktree("/git/repo-2", "/git/repo", "host/org/repo");

		expect(readWorktreeRegistry()).toHaveLength(1);
	});

	it("has no attribution for a path it never created", () => {
		expect(worktreeAttributionIncludingReaped("/git/other")).toBeUndefined();
	});

	it("leaves the store untouched when forgetting an unknown path", () => {
		forgetWorktree("/git/unknown");

		expect(save).not.toHaveBeenCalled();
	});
});
