import { beforeEach, describe, expect, it, vi } from "vitest";
import { allocateTree } from "./allocateTree";
import { createWorktree } from "./createWorktree";
import { checkDurabilitySync } from "./treeDurability";
import { worktreeConfigFor } from "./worktreeConfigFor";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../../../shared/findRepoRoot", () => ({
	findRepoRoot: (cwd: string) => (cwd.startsWith("/git/repo") ? cwd : null),
}));
vi.mock("./listWorktreePaths", () => ({ mainWorktree: () => "/git/repo" }));
vi.mock("./worktreeConfigFor", () => ({
	worktreeConfigFor: vi.fn(() => ({
		enabled: true,
		trunk: false,
		includeDrafts: false,
		install: true,
		commitBeforeManualChecks: false,
		copy: [],
	})),
}));
vi.mock("./treeDurability", () => ({
	checkDurabilitySync: vi.fn(() => ({ durable: true })),
}));
vi.mock("./createWorktree", () => ({
	createWorktree: vi.fn(() => "/git/repo-2"),
}));

const configMock = vi.mocked(worktreeConfigFor);
const durabilityMock = vi.mocked(checkDurabilitySync);
const createMock = vi.mocked(createWorktree);

describe("allocateTree", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		configMock.mockReturnValue({
			enabled: true,
			trunk: false,
			includeDrafts: false,
			install: true,
			commitBeforeManualChecks: false,
			copy: [],
		});
		durabilityMock.mockReturnValue({ durable: true });
		createMock.mockReturnValue("/git/repo-2");
	});

	describe("for an ordinary session", () => {
		it("reuses the clone even when it holds uncommitted work", () => {
			durabilityMock.mockReturnValue({
				durable: false,
				reason: "uncommitted changes",
			});

			expect(allocateTree("/git/repo", new Set())).toEqual({
				cwd: "/git/repo",
				kind: "primary",
				created: false,
				clone: "/git/repo",
			});
			expect(durabilityMock).not.toHaveBeenCalled();
		});

		it("passes the repo's branch strategy to the worktree it creates", () => {
			configMock.mockReturnValue({
				enabled: true,
				trunk: true,
				includeDrafts: false,
				root: "~/git",
				install: true,
				commitBeforeManualChecks: false,
				copy: [],
			});

			allocateTree("/git/repo", new Set(["/git/repo"]));

			expect(createMock).toHaveBeenCalledWith(
				"/git/repo",
				{ root: "~/git", trunk: true },
				new Set(["/git/repo"]),
			);
		});
	});

	describe("for a draft-type session", () => {
		it("stays in the clone even when another session already holds it", () => {
			expect(
				allocateTree("/git/repo", new Set(["/git/repo"]), { draftLike: true }),
			).toEqual({
				cwd: "/git/repo",
				kind: "primary",
				created: false,
				clone: "/git/repo",
			});
			expect(createMock).not.toHaveBeenCalled();
		});

		it("normalises a worktree cwd back to the clone", () => {
			expect(
				allocateTree("/git/repo-2", new Set(["/git/repo"]), { draftLike: true })
					.cwd,
			).toBe("/git/repo");
		});

		it("spills like any other session once includeDrafts is on", () => {
			configMock.mockReturnValue({
				enabled: true,
				trunk: false,
				includeDrafts: true,
				install: true,
				commitBeforeManualChecks: false,
				copy: [],
			});

			expect(
				allocateTree("/git/repo", new Set(["/git/repo"]), { draftLike: true }),
			).toEqual({
				cwd: "/git/repo-2",
				kind: "worktree",
				created: true,
				clone: "/git/repo",
			});
		});

		it("is inert when parallel work is off", () => {
			configMock.mockReturnValue({
				enabled: false,
				trunk: false,
				includeDrafts: false,
				install: true,
				commitBeforeManualChecks: false,
				copy: [],
			});

			expect(
				allocateTree("/git/repo/src", new Set(["/git/repo"]), {
					draftLike: true,
				}),
			).toEqual({ cwd: "/git/repo/src", kind: "primary", created: false });
		});
	});

	describe("for a PR checkout", () => {
		it("reuses the clone when it holds nothing in progress", () => {
			expect(
				allocateTree("/git/repo", new Set(), { forCheckout: true }),
			).toEqual({
				cwd: "/git/repo",
				kind: "primary",
				created: false,
				clone: "/git/repo",
			});
			expect(createMock).not.toHaveBeenCalled();
		});

		it("spills to a worktree rather than checking out over uncommitted work", () => {
			durabilityMock.mockReturnValue({
				durable: false,
				reason: "uncommitted changes",
			});

			expect(
				allocateTree("/git/repo", new Set(), { forCheckout: true }),
			).toEqual({
				cwd: "/git/repo-2",
				kind: "worktree",
				created: true,
				clone: "/git/repo",
			});
		});

		it("spills to a worktree rather than taking over unpushed commits", () => {
			durabilityMock.mockReturnValue({
				durable: false,
				reason: "unpushed commits",
			});

			expect(
				allocateTree("/git/repo", new Set(), { forCheckout: true }).kind,
			).toBe("worktree");
		});

		it("leaves the requested tree alone when parallel work is off", () => {
			configMock.mockReturnValue({
				enabled: false,
				trunk: false,
				includeDrafts: false,
				install: true,
				commitBeforeManualChecks: false,
				copy: [],
			});
			durabilityMock.mockReturnValue({
				durable: false,
				reason: "uncommitted changes",
			});

			expect(
				allocateTree("/git/repo/src", new Set(), { forCheckout: true }),
			).toEqual({ cwd: "/git/repo/src", kind: "primary", created: false });
			expect(createMock).not.toHaveBeenCalled();
		});
	});
});
