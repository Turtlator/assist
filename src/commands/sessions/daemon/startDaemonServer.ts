import { unlinkSync } from "node:fs";
import * as net from "node:net";
import { isDaemonRunning } from "./connectToDaemon";
import { daemonLog } from "./daemonLog";
import { daemonPaths } from "./daemonPaths";
import { handleConnection } from "./handleConnection";
import { onListening } from "./onListening";
import type { SessionManager } from "./SessionManager";
import { startWindowsBridge } from "./startWindowsBridge";

export async function startDaemonServer(
	manager: SessionManager,
	checkAutoExit: (idle: boolean) => void,
): Promise<void> {
	// why: the WSL daemon cannot reach the Windows named pipe, so add a TCP bridge
	if (process.platform === "win32" && !(await startWindowsBridge(manager))) {
		daemonLog(
			"exiting before binding the pipe so the next launch can take over",
		);
		process.exit(1);
	}
	const server = net.createServer((socket) =>
		handleConnection(socket, manager),
	);
	let retried = false;
	server.on("error", (e: NodeJS.ErrnoException) => {
		if (e.code !== "EADDRINUSE" || retried) {
			daemonLog(`server error: ${e.message}; exiting`);
			process.exit(1);
		}
		retried = true;
		void recoverFromAddrInUse(server, manager, checkAutoExit);
	});
	// Sessions are restored only after the socket is bound, so a daemon that
	// loses the startup race never resumes a duplicate copy of them
	listenWithSingleOnListening(server, manager, checkAutoExit);
}

function listenWithSingleOnListening(
	server: net.Server,
	manager: SessionManager,
	checkAutoExit: (idle: boolean) => void,
): void {
	server.removeAllListeners("listening");
	server.listen(daemonPaths.socket, () => onListening(manager, checkAutoExit));
}

// The socket path is taken: either a live daemon owns it (this process lost
// the startup race) or a crashed daemon left a stale file behind. Never
// unlink without first confirming nothing answers on it.
async function recoverFromAddrInUse(
	server: net.Server,
	manager: SessionManager,
	checkAutoExit: (idle: boolean) => void,
): Promise<void> {
	if (await isDaemonRunning()) {
		daemonLog("another daemon owns the socket; exiting");
		process.exit(1);
	}
	daemonLog("removing stale socket left by a crashed daemon");
	if (process.platform !== "win32") {
		try {
			unlinkSync(daemonPaths.socket);
		} catch {}
	}
	listenWithSingleOnListening(server, manager, checkAutoExit);
}
