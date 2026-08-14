import { readDaemonPidFile } from "./readDaemonPidFile";

export function reportStolenSocket(socketPid?: number): void {
	if (!socketPid) return;
	const filePid = readDaemonPidFile();
	if (filePid === undefined || filePid === socketPid) return;
	console.error(
		`Warning: daemon.pid records PID ${filePid} but the socket is owned by PID ${socketPid} (stolen socket)`,
	);
}
