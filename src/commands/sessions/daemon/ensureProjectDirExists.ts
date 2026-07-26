import { mkdirSync } from "node:fs";
import { daemonLog } from "./daemonLog";

export function ensureProjectDirExists(
	dir: string,
	sessionId: string,
): boolean {
	try {
		mkdirSync(dir, { recursive: true });
		return true;
	} catch (error) {
		daemonLog(
			`session ${sessionId} transcript dir unavailable: ${error instanceof Error ? error.message : String(error)}`,
		);
		return false;
	}
}
