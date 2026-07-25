import { watch } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gitCommonDir } from "./listWorktreePaths";
import { watchGitState } from "./watchGitState";

vi.mock("node:fs", () => ({
	existsSync: vi.fn(() => true),
	watch: vi.fn(),
}));
vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./listWorktreePaths", () => ({
	gitCommonDir: vi.fn(() => "/git/repo/.git"),
}));

const watchMock = watch as unknown as ReturnType<typeof vi.fn>;
const commonDirMock = gitCommonDir as unknown as ReturnType<typeof vi.fn>;

describe("watchGitState", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		commonDirMock.mockReturnValue("/git/repo/.git");
		watchMock.mockReturnValue({ close: vi.fn() });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("polls git state so a landed branch is noticed where fs events never arrive", () => {
		watchMock.mockImplementation(() => {
			throw new Error("recursive option not supported on this platform");
		});
		const onChange = vi.fn();

		watchGitState("/git/repo-2", onChange);
		vi.advanceTimersByTime(30_000);

		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it("polls as a safety net even when the fs watch is accepted", () => {
		const onChange = vi.fn();

		watchGitState("/git/repo-2", onChange);
		vi.advanceTimersByTime(30_000);

		expect(watchMock).toHaveBeenCalled();
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it("reports fs events after a debounce", () => {
		const onChange = vi.fn();
		watchMock.mockImplementation((_dir, _opts, listener: () => void) => {
			listener();
			return { close: vi.fn() };
		});

		watchGitState("/git/repo-2", onChange);
		vi.advanceTimersByTime(500);

		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it("stops both the watch and the poll on close", () => {
		const close = vi.fn();
		watchMock.mockReturnValue({ close });
		const onChange = vi.fn();

		watchGitState("/git/repo-2", onChange)?.close();
		vi.advanceTimersByTime(120_000);

		expect(close).toHaveBeenCalledTimes(1);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("gives back no watcher when the git dir cannot be resolved", () => {
		commonDirMock.mockReturnValue(null);

		expect(watchGitState("/git/repo-2", vi.fn())).toBeUndefined();
	});
});
