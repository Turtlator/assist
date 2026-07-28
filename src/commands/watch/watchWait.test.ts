import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WatchOutcome } from "./WatchOutcome";

const mockWaitForUpstream = vi.fn();
const mockPullFastForward = vi.fn();
const mockBuildWatchReport = vi.fn();
const mockRunWatchBuild = vi.fn<(...args: unknown[]) => Promise<unknown>>();

vi.mock("./waitForUpstream", () => ({
	waitForUpstream: (...args: unknown[]) => mockWaitForUpstream(...args),
}));

vi.mock("./pullFastForward", () => ({
	pullFastForward: (...args: unknown[]) => mockPullFastForward(...args),
}));

vi.mock("./buildWatchReport", () => ({
	buildWatchReport: (...args: unknown[]) => mockBuildWatchReport(...args),
}));

vi.mock("./runWatchBuild", () => ({
	runWatchBuild: (...args: unknown[]) => mockRunWatchBuild(...args),
}));

import { watchWait } from "./watchWait";

const moved: WatchOutcome = {
	kind: "moved",
	upstream: "origin/main",
	from: "aaa1111",
	to: "bbb2222",
	count: 2,
};

let logged: string[];
let errored: string[];
let written: string[];
let exitCode: number | undefined;

beforeEach(() => {
	vi.clearAllMocks();
	logged = [];
	errored = [];
	written = [];
	exitCode = undefined;
	mockBuildWatchReport.mockReturnValue("**Version** 0.488.2");
	vi.spyOn(console, "log").mockImplementation((message?: unknown) => {
		logged.push(String(message));
	});
	vi.spyOn(console, "error").mockImplementation((message?: unknown) => {
		errored.push(String(message));
	});
	vi.spyOn(process.stdout, "write").mockImplementation(((chunk: string) => {
		written.push(String(chunk));
		return true;
	}) as never);
	vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
		exitCode = code;
		throw new Error("exit");
	}) as never);
});

type RunOptions = {
	timeout?: string;
	pull?: boolean;
	build?: boolean | string;
};

const run = async (options: RunOptions = {}): Promise<void> => {
	await watchWait({
		interval: "30s",
		timeout: options.timeout ?? "none",
		pull: options.pull ?? true,
		build: options.build,
	}).catch(() => {});
};

const fastForwarded = { kind: "fast-forwarded", sha: "bbb2222" };

describe("watchWait --pull", () => {
	it("prints the report after a successful pull, baselined on the pre-pull sha", async () => {
		mockWaitForUpstream.mockResolvedValue(moved);
		mockPullFastForward.mockReturnValue(fastForwarded);

		await run();

		expect(mockBuildWatchReport).toHaveBeenCalledWith("aaa1111");
		expect(logged.join("\n")).toContain("**Version** 0.488.2");
		expect(exitCode).toBe(0);
	});

	it("does not print a report when the pull was blocked", async () => {
		mockWaitForUpstream.mockResolvedValue(moved);
		mockPullFastForward.mockReturnValue({
			kind: "blocked",
			reason: "fatal: Not possible to fast-forward, aborting.",
		});

		await run();

		expect(mockBuildWatchReport).not.toHaveBeenCalled();
		expect(exitCode).toBe(3);
	});
});

describe("watchWait --timeout", () => {
	it("waits without a deadline by default", async () => {
		mockWaitForUpstream.mockResolvedValue(moved);
		mockPullFastForward.mockReturnValue(fastForwarded);

		await run();

		expect(mockWaitForUpstream).toHaveBeenCalledWith(
			expect.objectContaining({ timeoutMs: undefined, timeout: "none" }),
		);
	});

	it("still exits 2 on an explicit finite timeout", async () => {
		mockWaitForUpstream.mockResolvedValue({
			kind: "timeout",
			upstream: "origin/main",
			timeout: "60m",
		});

		await run({ timeout: "60m" });

		expect(mockWaitForUpstream).toHaveBeenCalledWith(
			expect.objectContaining({ timeoutMs: 3_600_000 }),
		);
		expect(exitCode).toBe(2);
	});
});

describe("watchWait --build", () => {
	beforeEach(() => {
		mockWaitForUpstream.mockResolvedValue(moved);
		mockPullFastForward.mockReturnValue(fastForwarded);
	});

	it("runs the auto-build entry after a successful pull", async () => {
		mockRunWatchBuild.mockResolvedValue({ kind: "built" });

		await run({ build: true });

		expect(mockRunWatchBuild).toHaveBeenCalledWith("auto-build");
		expect(exitCode).toBe(0);
	});

	it("runs a named entry when one is given", async () => {
		mockRunWatchBuild.mockResolvedValue({ kind: "built" });

		await run({ build: "verify" });

		expect(mockRunWatchBuild).toHaveBeenCalledWith("verify");
	});

	it("exits 4 with the build output when the build fails", async () => {
		mockRunWatchBuild.mockResolvedValue({
			kind: "failed",
			exitCode: 1,
			output: "tsc: error TS2345",
		});

		await run({ build: true });

		expect(exitCode).toBe(4);
		expect(written.join("")).toContain("tsc: error TS2345");
		expect(errored.join("\n")).toContain('build "auto-build" failed');
	});

	it("does not build when the pull was blocked", async () => {
		mockPullFastForward.mockReturnValue({
			kind: "blocked",
			reason: "fatal: Not possible to fast-forward, aborting.",
		});

		await run({ build: true });

		expect(mockRunWatchBuild).not.toHaveBeenCalled();
		expect(exitCode).toBe(3);
	});

	it("does not build without --pull", async () => {
		await run({ pull: false, build: true });

		expect(mockRunWatchBuild).not.toHaveBeenCalled();
		expect(exitCode).toBe(0);
	});
});
