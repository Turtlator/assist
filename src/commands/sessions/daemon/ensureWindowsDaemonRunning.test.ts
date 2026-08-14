import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isWindowsDaemonRunning } from "./connectToWindowsDaemon";
import { ensureWindowsDaemonRunning } from "./ensureWindowsDaemonRunning";
import { WINDOWS_BRIDGE_FAILURE_PREFIX } from "./windowsBridgeFailureCause";

vi.mock("node:child_process", () => ({ spawn: vi.fn() }));
vi.mock("./connectToWindowsDaemon", () => ({
	isWindowsDaemonRunning: vi.fn(),
}));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const spawnMock = spawn as unknown as ReturnType<typeof vi.fn>;
const isRunningMock = isWindowsDaemonRunning as unknown as ReturnType<
	typeof vi.fn
>;

function fakeChild(): EventEmitter & { stdout: PassThrough } {
	const child = Object.assign(new EventEmitter(), {
		stdout: new PassThrough(),
		stderr: new PassThrough(),
		unref: vi.fn(),
	});
	spawnMock.mockReturnValue(child);
	return child;
}

async function untilLaunched(): Promise<void> {
	while (spawnMock.mock.calls.length === 0)
		await new Promise((resolve) => setImmediate(resolve));
}

describe("ensureWindowsDaemonRunning", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("does not launch when the windows daemon already answers", async () => {
		isRunningMock.mockResolvedValue(true);

		await ensureWindowsDaemonRunning();

		expect(spawnMock).not.toHaveBeenCalled();
	});

	it("fails fast with the bridge cause instead of the install hint", async () => {
		isRunningMock.mockResolvedValue(false);
		const child = fakeChild();
		const pending = ensureWindowsDaemonRunning();
		child.stdout.write(
			`2026-08-13T22:44:01.000Z [1234] ${WINDOWS_BRIDGE_FAILURE_PREFIX} could not bind port 51764 after 3 attempts\n`,
		);

		await expect(pending).rejects.toThrow(
			/windows bridge unavailable: could not bind port 51764/,
		);
		await expect(pending).rejects.not.toThrow(/is assist installed/);
	});

	it("fails fast when the launcher itself cannot start", async () => {
		isRunningMock.mockResolvedValue(false);
		const child = fakeChild();
		const pending = ensureWindowsDaemonRunning();
		await untilLaunched();
		child.emit("error", new Error("spawn pwsh.exe ENOENT"));

		await expect(pending).rejects.toThrow(/could not launch pwsh.exe/);
	});
});
