import * as net from "node:net";
import { daemonLog } from "./daemonLog";
import { exitAfterFlush } from "./exitAfterFlush";
import { findPortHolderPid } from "./findPortHolderPid";
import { handleConnection } from "./handleConnection";
import type { SessionManager } from "./SessionManager";
import { WINDOWS_BRIDGE_FAILURE_PREFIX } from "./windowsBridgeFailureCause";
import { windowsDaemonPort } from "./windowsDaemonPort";

const BIND_ATTEMPTS = 3;
const BIND_RETRY_DELAY_MS = 250;
const KEEPALIVE_PROBE_MS = 10_000;

export async function startWindowsBridge(
	manager: SessionManager,
): Promise<boolean> {
	const port = windowsDaemonPort();
	for (let attempt = 1; attempt <= BIND_ATTEMPTS; attempt++) {
		const error = await bindBridge(manager, port);
		if (!error) {
			daemonLog(`windows bridge listening on :${port}`);
			return true;
		}
		daemonLog(
			`windows bridge bind attempt ${attempt}/${BIND_ATTEMPTS} on :${port} failed: ${error.message}`,
		);
		if (attempt < BIND_ATTEMPTS) await delay(BIND_RETRY_DELAY_MS);
	}
	daemonLog(
		`${WINDOWS_BRIDGE_FAILURE_PREFIX} could not bind port ${port} after ${BIND_ATTEMPTS} attempts; ${describePortHolder(port)}`,
	);
	return false;
}

function describePortHolder(port: number): string {
	const holder = findPortHolderPid(port);
	return holder !== undefined && holder !== process.pid
		? `PID ${holder} is listening on it — kill PID ${holder} to free the port`
		: "the port is held by another process or reserved by a Hyper-V/WSL dynamic port range — set sessions.windowsDaemonPort to a free port outside 49152-65535";
}

function bindBridge(
	manager: SessionManager,
	port: number,
): Promise<NodeJS.ErrnoException | null> {
	return new Promise((resolve) => {
		const bridge = net.createServer((socket) => {
			socket.setKeepAlive(true, KEEPALIVE_PROBE_MS);
			handleConnection(socket, manager);
		});
		bridge.once("error", (error: NodeJS.ErrnoException) => {
			bridge.close(() => {});
			resolve(error);
		});
		bridge.listen(port, () => {
			bridge.removeAllListeners("error");
			bridge.on("error", (error: NodeJS.ErrnoException) => {
				daemonLog(
					`${WINDOWS_BRIDGE_FAILURE_PREFIX} ${error.message} after listening; exiting so the next launch can take over`,
				);
				exitAfterFlush(1);
			});
			resolve(null);
		});
	});
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
