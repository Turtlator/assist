import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import { boundTreeRoots } from "./boundTreeRoots";
import { checkDurabilitySync } from "./treeDurability";
import { worktreeConfigFor } from "./worktreeConfigFor";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../../../shared/findRepoRoot", () => ({
	findRepoRoot: (cwd: string) => cwd,
}));
vi.mock("./worktreeConfigFor", () => ({
	worktreeConfigFor: vi.fn(() => ({ enabled: true, install: true, copy: [] })),
}));
vi.mock("./treeDurability", () => ({
	checkDurabilitySync: vi.fn(() => ({ durable: true })),
}));

const configMock = worktreeConfigFor as unknown as ReturnType<typeof vi.fn>;
const durabilityMock = checkDurabilitySync as unknown as ReturnType<
	typeof vi.fn
>;

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		pty: null,
		scrollback: "",
		cwd: "/git/repo",
		...overrides,
	};
}

function map(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((s) => [s.id, s]));
}

describe("boundTreeRoots", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		configMock.mockReturnValue({ enabled: true, install: true, copy: [] });
		durabilityMock.mockReturnValue({ durable: true });
	});

	it("counts a live session as holding its tree", () => {
		expect(boundTreeRoots(map(session()))).toEqual(new Set(["/git/repo"]));
	});

	it("counts a stopped session as holding its tree", () => {
		expect(boundTreeRoots(map(session({ status: "stopped" })))).toEqual(
			new Set(["/git/repo"]),
		);
	});

	it("frees the tree of a finished session whose work is landed", () => {
		expect(boundTreeRoots(map(session({ status: "done" })))).toEqual(new Set());
	});

	it("frees the tree of an errored session whose work is landed", () => {
		expect(boundTreeRoots(map(session({ status: "error" })))).toEqual(
			new Set(),
		);
	});

	it("keeps holding a finished session's tree while it carries unlanded work", () => {
		durabilityMock.mockReturnValue({
			durable: false,
			reason: "uncommitted changes",
		});

		expect(boundTreeRoots(map(session({ status: "done" })))).toEqual(
			new Set(["/git/repo"]),
		);
	});

	it("keeps holding a tree whose teardown is still in flight", () => {
		expect(
			boundTreeRoots(map(session({ status: "done", closing: true }))),
		).toEqual(new Set(["/git/repo"]));
	});

	it("never probes git when parallel work is off for the repo", () => {
		configMock.mockReturnValue({ enabled: false, install: true, copy: [] });

		expect(boundTreeRoots(map(session({ status: "done" })))).toEqual(
			new Set(["/git/repo"]),
		);
		expect(durabilityMock).not.toHaveBeenCalled();
	});

	it("does not re-probe a tree a live session already holds", () => {
		const roots = boundTreeRoots(
			map(session({ id: "1" }), session({ id: "2", status: "done" })),
		);

		expect(roots).toEqual(new Set(["/git/repo"]));
		expect(durabilityMock).not.toHaveBeenCalled();
	});
});
