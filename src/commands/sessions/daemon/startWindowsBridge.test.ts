import { EventEmitter } from "node:events";
import * as net from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { daemonLog } from "./daemonLog";
import { exitAfterFlush } from "./exitAfterFlush";
import { findPortHolderPid } from "./findPortHolderPid";
import type { SessionManager } from "./SessionManager";
import { startWindowsBridge } from "./startWindowsBridge";
import { WINDOWS_BRIDGE_FAILURE_PREFIX } from "./windowsBridgeFailureCause";

vi.mock("node:net", () => ({ createServer: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./exitAfterFlush", () => ({ exitAfterFlush: vi.fn() }));
vi.mock("./findPortHolderPid", () => ({ findPortHolderPid: vi.fn() }));
vi.mock("./handleConnection", () => ({ handleConnection: vi.fn() }));
vi.mock("./windowsDaemonPort", () => ({ windowsDaemonPort: () => 51764 }));

const createServerMock = net.createServer as unknown as ReturnType<
	typeof vi.fn
>;
const logMock = daemonLog as unknown as ReturnType<typeof vi.fn>;
const exitAfterFlushMock = exitAfterFlush as unknown as ReturnType<
	typeof vi.fn
>;
const holderMock = findPortHolderPid as unknown as ReturnType<typeof vi.fn>;

function eaddrinuse(): NodeJS.ErrnoException {
	return Object.assign(
		new Error("listen EADDRINUSE: address already in use :::51764"),
		{ code: "EADDRINUSE" },
	);
}

class FakeBridge extends EventEmitter {
	closed = false;
	constructor(private readonly outcome: "error" | "listening") {
		super();
	}
	listen(_port: number, onListening: () => void): this {
		queueMicrotask(() => {
			if (this.outcome === "error") this.emit("error", eaddrinuse());
			else onListening();
		});
		return this;
	}
	close(callback?: () => void): this {
		this.closed = true;
		callback?.();
		return this;
	}
}

function queueBridges(...outcomes: ("error" | "listening")[]): FakeBridge[] {
	const bridges = outcomes.map((outcome) => new FakeBridge(outcome));
	let index = 0;
	createServerMock.mockImplementation(() => bridges[index++]);
	return bridges;
}

function loggedLines(): string[] {
	return logMock.mock.calls.map((call) => String(call[0]));
}

const manager = {} as SessionManager;

describe("startWindowsBridge", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("reports success once the bridge is listening", async () => {
		queueBridges("listening");

		await expect(startWindowsBridge(manager)).resolves.toBe(true);
		expect(loggedLines()).toContainEqual(
			expect.stringContaining("windows bridge listening on :51764"),
		);
	});

	it("retries a bind failure and succeeds when the port frees up", async () => {
		queueBridges("error", "listening");

		await expect(startWindowsBridge(manager)).resolves.toBe(true);
		expect(createServerMock).toHaveBeenCalledTimes(2);
	});

	it("reports failure with the real cause after exhausting retries", async () => {
		const bridges = queueBridges("error", "error", "error");

		await expect(startWindowsBridge(manager)).resolves.toBe(false);
		expect(createServerMock).toHaveBeenCalledTimes(3);
		expect(bridges.every((bridge) => bridge.closed)).toBe(true);
		expect(loggedLines()).toContainEqual(expect.stringContaining("EADDRINUSE"));
		expect(loggedLines()).toContainEqual(
			expect.stringContaining(
				`${WINDOWS_BRIDGE_FAILURE_PREFIX} could not bind port 51764`,
			),
		);
	});

	it("names the process holding the port when it can be identified", async () => {
		holderMock.mockReturnValue(192936);
		queueBridges("error", "error", "error");

		await expect(startWindowsBridge(manager)).resolves.toBe(false);
		expect(holderMock).toHaveBeenCalledWith(51764);
		expect(loggedLines()).toContainEqual(
			expect.stringContaining("kill PID 192936 to free the port"),
		);
	});

	it("exits when the bridge dies after it started listening", async () => {
		const [bridge] = queueBridges("listening");

		await startWindowsBridge(manager);
		bridge?.emit("error", eaddrinuse());

		expect(exitAfterFlushMock).toHaveBeenCalledWith(1);
		expect(loggedLines()).toContainEqual(
			expect.stringContaining(WINDOWS_BRIDGE_FAILURE_PREFIX),
		);
	});
});
