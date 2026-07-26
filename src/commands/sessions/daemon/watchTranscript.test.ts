import { beforeEach, describe, expect, it, vi } from "vitest";
import { watch } from "node:fs";
import type { Session } from "./createSession";
import { ensureProjectDirExists } from "./ensureProjectDirExists";
import { startTranscriptTitleGeneration } from "./startTranscriptTitleGeneration";
import { watchTranscript } from "./watchTranscript";

vi.mock("node:fs", () => ({
	watch: vi.fn(),
}));

vi.mock("./ensureProjectDirExists", () => ({
	ensureProjectDirExists: vi.fn(() => true),
}));

vi.mock("../shared/findTranscriptPathSync", () => ({
	projectDirForCwd: (cwd: string) => `/projects${cwd}`,
}));

vi.mock("./reconcileTranscriptStatus", () => ({
	reconcileTranscriptStatus: vi.fn(),
}));

vi.mock("./startTranscriptTitleGeneration", () => ({
	startTranscriptTitleGeneration: vi.fn(),
}));

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const watchMock = watch as unknown as ReturnType<typeof vi.fn>;
const ensureDirMock = ensureProjectDirExists as unknown as ReturnType<
	typeof vi.fn
>;
const titleMock = startTranscriptTitleGeneration as unknown as ReturnType<
	typeof vi.fn
>;

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "3",
		status: "running",
		cwd: "/home/me/repo",
		claudeSessionId: "phase-1",
		...overrides,
	} as unknown as Session;
}

describe("watchTranscript", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		ensureDirMock.mockReturnValue(true);
		watchMock.mockImplementation(() => ({ close: vi.fn() }));
	});

	it("creates the project dir so a fresh worktree still binds", () => {
		const s = session({ cwd: "/home/me/fresh-worktree" });

		watchTranscript(s, vi.fn(), vi.fn());

		expect(ensureDirMock).toHaveBeenCalledWith(
			"/projects/home/me/fresh-worktree",
			"3",
		);
		expect(watchMock).toHaveBeenCalledTimes(1);
		expect(s.watchedTranscriptId).toBe("phase-1");
	});

	it("skips binding when the project dir cannot be created", () => {
		ensureDirMock.mockReturnValue(false);
		const s = session();

		watchTranscript(s, vi.fn(), vi.fn());

		expect(watchMock).not.toHaveBeenCalled();
		expect(s.watchedTranscriptId).toBeUndefined();
	});

	it("binds a watcher for the session's current transcript", () => {
		const s = session();

		watchTranscript(s, vi.fn(), vi.fn());

		expect(watchMock).toHaveBeenCalledTimes(1);
		expect(s.watchedTranscriptId).toBe("phase-1");
	});

	it("does not re-bind while the claude session id is unchanged", () => {
		const s = session();

		watchTranscript(s, vi.fn(), vi.fn());
		watchTranscript(s, vi.fn(), vi.fn());

		expect(watchMock).toHaveBeenCalledTimes(1);
	});

	it("offers each watcher fire to title generation", () => {
		const notify = vi.fn();
		const s = session();

		watchTranscript(s, notify, vi.fn());

		expect(titleMock).toHaveBeenCalledWith(s, notify);
	});

	it("follows a phase transition to a new claude session id, closing the stale watcher", () => {
		const close = vi.fn();
		watchMock.mockImplementationOnce(() => ({ close }));
		const s = session({
			transcriptPath: "/projects/home/me/repo/phase-1.jsonl",
		});

		watchTranscript(s, vi.fn(), vi.fn());
		s.claudeSessionId = "phase-2";
		watchTranscript(s, vi.fn(), vi.fn());

		expect(close).toHaveBeenCalledTimes(1);
		expect(watchMock).toHaveBeenCalledTimes(2);
		expect(s.watchedTranscriptId).toBe("phase-2");
		expect(s.transcriptPath).toBeUndefined();
	});
});
