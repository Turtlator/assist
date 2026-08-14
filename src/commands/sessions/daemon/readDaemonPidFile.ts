import { readFileSync } from "node:fs";
import { daemonPaths } from "./daemonPaths";

export function readDaemonPidFile(): number | undefined {
	try {
		const pid = Number.parseInt(
			readFileSync(daemonPaths.pid, "utf8").trim(),
			10,
		);
		return Number.isInteger(pid) ? pid : undefined;
	} catch {
		return undefined;
	}
}

export function isPidAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return (error as NodeJS.ErrnoException).code === "EPERM";
	}
}
