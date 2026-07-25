import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { allocateTree } from "../sessions/daemon/worktree/allocateTree";
import { seedWorktree } from "../sessions/daemon/worktree/seedWorktree";
import { moveToPrCheckoutTree } from "./moveToPrCheckoutTree";

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));
vi.mock("../sessions/daemon/worktree/persistedTreeRoots", () => ({
	persistedTreeRoots: () => new Set(["/git/repo"]),
}));
vi.mock("../sessions/daemon/worktree/allocateTree", () => ({
	allocateTree: vi.fn(),
}));
vi.mock("../sessions/daemon/worktree/seedWorktree", () => ({
	seedWorktree: vi.fn((_path: string, _clone: string, onSeeded: () => void) =>
		onSeeded(),
	),
}));

const allocateMock = vi.mocked(allocateTree);
const seedMock = vi.mocked(seedWorktree);

let chdir: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	chdir = vi.spyOn(process, "chdir").mockImplementation(() => {});
	vi.spyOn(process, "cwd").mockReturnValue("/git/repo");
	delete process.env.ASSIST_SESSION;
});

afterEach(() => {
	vi.restoreAllMocks();
	delete process.env.ASSIST_SESSION;
});

describe("moveToPrCheckoutTree", () => {
	it("moves into a freshly created worktree and seeds it before returning", async () => {
		allocateMock.mockReturnValue({
			cwd: "/git/repo-2",
			kind: "worktree",
			created: true,
			clone: "/git/repo",
		});

		await moveToPrCheckoutTree();

		expect(allocateMock).toHaveBeenCalledWith(
			"/git/repo",
			new Set(["/git/repo"]),
			{ forCheckout: true },
		);
		expect(chdir).toHaveBeenCalledWith("/git/repo-2");
		expect(seedMock).toHaveBeenCalledWith(
			"/git/repo-2",
			"/git/repo",
			expect.any(Function),
		);
	});

	it("moves into an existing tree without reseeding it", async () => {
		vi.spyOn(process, "cwd").mockReturnValue("/git/repo-3");
		allocateMock.mockReturnValue({
			cwd: "/git/repo",
			kind: "primary",
			created: false,
			clone: "/git/repo",
		});

		await moveToPrCheckoutTree();

		expect(chdir).toHaveBeenCalledWith("/git/repo");
		expect(seedMock).not.toHaveBeenCalled();
	});

	it("stays put when the allocator picks the tree it was invoked in", async () => {
		allocateMock.mockReturnValue({
			cwd: "/git/repo",
			kind: "primary",
			created: false,
			clone: "/git/repo",
		});

		await moveToPrCheckoutTree();

		expect(chdir).not.toHaveBeenCalled();
	});

	it("leaves placement to the daemon inside a managed session", async () => {
		process.env.ASSIST_SESSION = "1";

		await moveToPrCheckoutTree();

		expect(allocateMock).not.toHaveBeenCalled();
		expect(chdir).not.toHaveBeenCalled();
	});
});
